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
import { GITHUB_ANALYSIS_LIMITS } from "@/lib/github/github-analysis-limits";
import { validateZipSecurity } from "@/lib/github/github-zip-security";
import {
    acquireAnalysisSlot,
    checkRateLimit,
    cleanupRateLimitIfNeeded,
    getClientIp,
    releaseAnalysisSlot,
} from "@/lib/github/github-request-protection";
import {
    getRedisJson,
    setRedisJson,
} from "@/lib/redis/redis-cache";
import { repositoryAnalysisKey } from "@/lib/redis/redis-keys";

export async function POST(request: NextRequest) {
    // Limpeza ocasional do armazenamento do rate limit.
    cleanupRateLimitIfNeeded();
    // Identifica o cliente.
    const clientIp = getClientIp(request);
    // Rate limit por IP antes de qualquer operação pesada.
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
        const repository = parseGitHubRepository(repositoryUrl);
        if (!repository) {
            return NextResponse.json(
                { error: "URL inválida do GitHub." },
                { status: 400 }
            );
        }
        const repositoryData = await getRepository(repository);
        const repositorySizeInBytes = repositoryData.size * 1024;
        // Valida o tamanho informado pelo GitHub antes de obter o código.
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
        // A árvore contém o SHA da versão atual do conteúdo do repositório.
        const treeData = await getRepositoryTree(repository, branch);
        const cacheKey = repositoryAnalysisKey(
            repository.owner,
            repository.repository,
            treeData.sha
        );
        // Procura a análise correspondente exatamente à versão atual do código.
        const cachedAnalysis = await getRedisJson<{
            repository: Awaited<ReturnType<typeof getRepository>>;
            languages: string[];
            branch: string;
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
        }>(cacheKey);
        if (cachedAnalysis) {
            return NextResponse.json(
                cachedAnalysis,
                {
                    headers: {
                        "X-Cache": "HIT",
                        "X-Repository-SHA": treeData.sha,
                        "X-RateLimit-Limit": String(GITHUB_ANALYSIS_LIMITS.rateLimit.maxRequests),
                        "X-RateLimit-Remaining": String(rateLimit.remaining),
                    },
                }
            );
        }
        // O slot só é consumido quando realmente precisamos processar o repositório.
        const slotAcquired = acquireAnalysisSlot();
        if (!slotAcquired) {
            return NextResponse.json(
                {
                    error: "O servidor está processando muitas análises simultaneamente. Tente novamente em alguns segundos.",
                    code: "ANALYSIS_CONCURRENCY_LIMIT",
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "10",
                    },
                }
            );
        }
        try {
            const languages = await getRepositoryLanguages(repository);
            const relevantFiles = filterRepositoryFiles(treeData.tree);
            const zipBuffer = await downloadRepositoryZip(repository, branch);
            // Segunda proteção: valida o tamanho real do ZIP recebido.
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
            // Proteção contra ZIP bombs, path traversal e excesso de entradas.
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
            const result = {
                repository: repositoryData,
                languages,
                branch,
                sha: treeData.sha,
                structure,
                analysis,
                files: processed.files,
                skippedFiles: processed.skippedFiles,
            };
            // Salva a análise da versão atual do repositório por 24 horas.
            await setRedisJson(cacheKey, result);
            return NextResponse.json(
                result,
                {
                    headers: {
                        "X-Cache": "MISS",
                        "X-Repository-SHA": treeData.sha,
                        "X-RateLimit-Limit": String(GITHUB_ANALYSIS_LIMITS.rateLimit.maxRequests),
                        "X-RateLimit-Remaining": String(rateLimit.remaining),
                    },
                }
            );
        } finally {
            // Libera a vaga independentemente de sucesso, erro ou timeout.
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