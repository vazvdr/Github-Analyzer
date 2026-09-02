import { NextRequest, NextResponse } from "next/server";

import { analyzeRepositoryWithGemini } from "@/lib/ai/gemini-analysis";
import { parseGitHubRepository } from "@/lib/github/github-url";

import {
    getRepositoryAIAnalysis,
    saveRepositoryAIAnalysis,
} from "@/lib/redis/repository-cache";

import { connectRedis } from "@/lib/redis/redis-client";
import { getRedisJson } from "@/lib/redis/redis-cache";

import type { RepositoryAnalysisCache } from "@/lib/redis/redis.types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const repositoryUrl = body.url;

        if (typeof repositoryUrl !== "string") {
            return NextResponse.json(
                {
                    error: "URL do repositório não informada.",
                },
                {
                    status: 400,
                }
            );
        }

        const repository = parseGitHubRepository(repositoryUrl);

        if (!repository) {
            return NextResponse.json(
                {
                    error: "URL inválida do GitHub.",
                },
                {
                    status: 400,
                }
            );
        }

        // Recupera a análise do GitHub salva no Redis
        const repositoryAnalysis =
            await findLatestRepositoryAnalysis(
                repository.owner,
                repository.repository
            );

        if (!repositoryAnalysis) {
            return NextResponse.json(
                {
                    error:
                        "A análise do repositório não foi encontrada no Redis.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            sha,
            repository: repositoryData,
            files,
        } = repositoryAnalysis;

        // Verifica se o repositório já possui análise do Gemini
        const cachedAIAnalysis =
            await getRepositoryAIAnalysis(
                repository.owner,
                repository.repository,
                sha
            );

        if (cachedAIAnalysis) {
            return NextResponse.json(
                cachedAIAnalysis,
                {
                    headers: {
                        "X-Cache": "HIT",
                        "X-Repository-SHA": sha,
                    },
                }
            );
        }

        // Envia para o Gemini os arquivos processados pelo servidor
        const aiAnalysis =
            await analyzeRepositoryWithGemini(
                repositoryData.full_name,
                files.map((file) => ({
                    path: file.path,
                    content: file.content,
                }))
            );

        const result = {
            repository: repositoryData,
            sha,
            analysis: aiAnalysis,
            createdAt: new Date().toISOString(),
        };

        // Salva a análise do Gemini no Redis por 24 horas
        await saveRepositoryAIAnalysis(
            repository.owner,
            repository.repository,
            sha,
            result
        );

        return NextResponse.json(
            result,
            {
                headers: {
                    "X-Cache": "MISS",
                    "X-Repository-SHA": sha,
                },
            }
        );
    } catch (error) {
        console.error(
            "Erro ao analisar repositório com Gemini:",
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : "Erro interno ao analisar o repositório com IA.";

        return NextResponse.json(
            {
                error: message,
            },
            {
                status: 500,
            }
        );
    }
}

async function findLatestRepositoryAnalysis(
    owner: string,
    repository: string
): Promise<
    (RepositoryAnalysisCache & {
        sha: string;
    }) | null
> {
    const redis = await connectRedis();

    const pattern =
        `github-analyzer:analysis:${owner}:${repository}:*`;

    let cursor = "0";

    do {
        const result = await redis.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
        });

        cursor = result.cursor;

        if (result.keys.length === 0) {
            continue;
        }

        for (const key of result.keys) {
            const data =
                await getRedisJson<RepositoryAnalysisCache>(
                    key
                );

            if (!data) {
                continue;
            }

            const sha = key.split(":").pop();

            if (!sha) {
                continue;
            }

            return {
                ...data,
                sha,
            };
        }
    } while (cursor !== "0");

    return null;
}