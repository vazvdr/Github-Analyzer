import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import {
    downloadRepositoryZip,
    getRepository,
    getRepositoryLanguages,
    getRepositoryTree,
} from "@/lib/github/github-client";
import { parseGitHubRepository } from "@/lib/github/github-url";
import { filterRepositoryFiles } from "@/lib/github/github-file-filter";
import { processRepositoryFiles } from "@/lib/github/github-file-processor";
import { createRepositoryChunks } from "@/lib/github/github-file-chunker";
import { GITHUB_ANALYSIS_LIMITS } from "@/lib/github/github-analysis-limits";
import { validateZipSecurity } from "@/lib/github/github-zip-security";
import {
    acquireAnalysisSlot,
    checkRateLimit,
    cleanupRateLimitIfNeeded,
    getClientIp,
    releaseAnalysisSlot,
} from "@/lib/github/github-request-protection";
import { getRedisJson, setRedisJson } from "@/lib/redis/redis-cache";
import { repositoryAnalysisKey } from "@/lib/redis/redis-keys";
import {
    getRepositoryChunks,
    saveRepositoryChunks,
} from "@/lib/redis/repository-cache";
import { analyzeRepositoryWithGemini } from "@/lib/ai/gemini-analysis";

import type {
    AIRepositoryAnalysis,
    GitHubRepositoryResponse,
} from "@/lib/github/github.types";
import type { SupportedLanguage } from "@/lib/ai/gemini-prompts";

interface CachedRepositoryAnalysis {
    repository: GitHubRepositoryResponse;
    languages: string[];
    branch: string;
    sha?: string;
    structure: {
        totalFiles: number;
        relevantFiles: number;
        analyzedFiles: number;
        skippedFiles: number;
        truncated: boolean;
    };
    analysis: {
        limited: boolean;
        reason: string | null;
    };
    files: Awaited<ReturnType<typeof processRepositoryFiles>>["files"];
    skippedFiles: string[];
    aiAnalysis?: {
        pt: AIRepositoryAnalysis | null;
        en: AIRepositoryAnalysis | null;
        es: AIRepositoryAnalysis | null;
    };
}
function isSupportedLanguage(language: unknown): language is SupportedLanguage {
    return language === "pt" || language === "en" || language === "es";
}
export async function POST(request: NextRequest) {
    cleanupRateLimitIfNeeded();
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
        return NextResponse.json(
            {
                error: "Limite de análises atingido. Tente novamente mais tarde.",
                code: "RATE_LIMIT_EXCEEDED",
                retryAfterSeconds: rateLimit.retryAfterSeconds,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": String(rateLimit.retryAfterSeconds),
                    "X-RateLimit-Limit": String(GITHUB_ANALYSIS_LIMITS.rateLimit.maxRequests),
                    "X-RateLimit-Remaining": "0",
                },
            }
        );
    }
    try {
        const body = await request.json();
        const repositoryUrl = body.url;
        if (typeof repositoryUrl !== "string") {
            return NextResponse.json(
                { error: "URL do repositório não informada." },
                { status: 400 }
            );
        }
        const language: SupportedLanguage = isSupportedLanguage(body.language)
            ? body.language
            : "pt";
        const repository = parseGitHubRepository(repositoryUrl);
        if (!repository) {
            return NextResponse.json(
                { error: "URL inválida do GitHub." },
                { status: 400 }
            );
        }
        const repositoryData = await getRepository(repository);
        const repositorySizeInBytes = repositoryData.size * 1024;
        if (repositorySizeInBytes > GITHUB_ANALYSIS_LIMITS.maxZipSize) {
            const languages = await getRepositoryLanguages(repository);
            return NextResponse.json(
                {
                    error: "Este repositório é muito grande para ser analisado. Estamos selecionando apenas os arquivos mais relevantes para a análise.",
                    code: "REPOSITORY_TOO_LARGE",
                    repository: repositoryData,
                    languages,
                },
                { status: 413 }
            );
        }
        const branch = repositoryData.default_branch;
        const treeData = await getRepositoryTree(repository, branch);
        const cacheKey = repositoryAnalysisKey(
            repository.owner,
            repository.repository,
            treeData.sha
        );
        const cachedAnalysis = await getRedisJson<CachedRepositoryAnalysis>(cacheKey);
        if (cachedAnalysis) {
            const existingChunks = await getRepositoryChunks(
                repository.owner,
                repository.repository,
                treeData.sha
            );
            if (!existingChunks) {
                const chunks = createRepositoryChunks(
                    repositoryData.full_name,
                    cachedAnalysis.files
                );
                await saveRepositoryChunks(
                    repository.owner,
                    repository.repository,
                    treeData.sha,
                    chunks
                );
            }
            const cachedLanguageAnalysis = cachedAnalysis.aiAnalysis?.[language];
            if (cachedLanguageAnalysis) {
                return NextResponse.json(cachedAnalysis, {
                    headers: {
                        "X-Cache": "HIT",
                        "X-Repository-SHA": treeData.sha,
                        "X-RateLimit-Limit": String(GITHUB_ANALYSIS_LIMITS.rateLimit.maxRequests),
                        "X-RateLimit-Remaining": String(rateLimit.remaining),
                    },
                });
            }
            const slotAcquired = acquireAnalysisSlot();
            if (!slotAcquired) {
                return NextResponse.json(
                    {
                        error: "O servidor está processando muitas análises simultaneamente. Tente novamente em alguns segundos.",
                        code: "ANALYSIS_CONCURRENCY_LIMIT",
                    },
                    {
                        status: 429,
                        headers: { "Retry-After": "10" },
                    }
                );
            }
            try {
                const aiAnalysis = await analyzeRepositoryWithGemini(
                    cachedAnalysis.repository.name,
                    cachedAnalysis.files,
                    language
                );
                const updatedAnalysis: CachedRepositoryAnalysis = {
                    ...cachedAnalysis,
                    sha: treeData.sha,
                    aiAnalysis: {
                        pt: cachedAnalysis.aiAnalysis?.pt ?? null,
                        en: cachedAnalysis.aiAnalysis?.en ?? null,
                        es: cachedAnalysis.aiAnalysis?.es ?? null,
                        [language]: aiAnalysis,
                    },
                };
                await setRedisJson(cacheKey, updatedAnalysis);
                return NextResponse.json(updatedAnalysis, {
                    headers: {
                        "X-Cache": "HIT-AI-MISS",
                        "X-Repository-SHA": treeData.sha,
                        "X-RateLimit-Limit": String(GITHUB_ANALYSIS_LIMITS.rateLimit.maxRequests),
                        "X-RateLimit-Remaining": String(rateLimit.remaining),
                    },
                });
            } finally {
                releaseAnalysisSlot();
            }
        }
        const slotAcquired = acquireAnalysisSlot();
        if (!slotAcquired) {
            return NextResponse.json(
                {
                    error: "O servidor está processando muitas análises simultaneamente. Tente novamente em alguns segundos.",
                    code: "ANALYSIS_CONCURRENCY_LIMIT",
                },
                {
                    status: 429,
                    headers: { "Retry-After": "10" },
                }
            );
        }
        try {
            const languages = await getRepositoryLanguages(repository);
            const relevantFiles = filterRepositoryFiles(treeData.tree);
            const zipBuffer = await downloadRepositoryZip(repository, branch);
            if (zipBuffer.byteLength > GITHUB_ANALYSIS_LIMITS.maxZipSize) {
                return NextResponse.json(
                    {
                        error: "O ZIP do repositório excede o tamanho máximo permitido.",
                        code: "ZIP_TOO_LARGE",
                        repository: repositoryData,
                        languages,
                    },
                    { status: 413 }
                );
            }
            const zip = await JSZip.loadAsync(zipBuffer);
            validateZipSecurity(zip);
            const processed = await processRepositoryFiles(zip, relevantFiles);
            const structure = {
                totalFiles: treeData.tree.length,
                relevantFiles: relevantFiles.length,
                analyzedFiles: processed.files.length,
                skippedFiles: processed.skippedFiles.length,
                truncated: treeData.truncated || processed.truncated,
            };
            const analysis = {
                limited:
                    treeData.truncated ||
                    processed.truncated ||
                    processed.skippedFiles.length > 0,
                reason: treeData.truncated
                    ? "A árvore de arquivos do repositório foi limitada pelo GitHub."
                    : processed.truncated
                      ? "A análise foi limitada devido aos limites de processamento."
                      : processed.skippedFiles.length > 0
                        ? "Alguns arquivos foram ignorados por não serem relevantes para a análise."
                        : null,
            };
            const chunks = createRepositoryChunks(
                repositoryData.full_name,
                processed.files
            );
            await saveRepositoryChunks(
                repository.owner,
                repository.repository,
                treeData.sha,
                chunks
            );
            const aiAnalysis = await analyzeRepositoryWithGemini(
                repositoryData.name,
                processed.files,
                language
            );
            const result: CachedRepositoryAnalysis = {
                repository: repositoryData,
                languages,
                branch,
                sha: treeData.sha,
                structure,
                analysis,
                files: processed.files,
                skippedFiles: processed.skippedFiles,
                aiAnalysis: {
                    pt: null,
                    en: null,
                    es: null,
                    [language]: aiAnalysis,
                },
            };
            await setRedisJson(cacheKey, result);
            return NextResponse.json(result, {
                headers: {
                    "X-Cache": "MISS",
                    "X-Repository-SHA": treeData.sha,
                    "X-RateLimit-Limit": String(GITHUB_ANALYSIS_LIMITS.rateLimit.maxRequests),
                    "X-RateLimit-Remaining": String(rateLimit.remaining),
                },
            });
        } finally {
            releaseAnalysisSlot();
        }
    } catch (error) {
        console.error("Erro ao consultar GitHub:", error);
        const message =
            error instanceof Error
                ? error.message
                : "Erro interno ao consultar o GitHub.";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}