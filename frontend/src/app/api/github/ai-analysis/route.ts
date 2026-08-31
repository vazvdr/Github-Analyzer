import { NextRequest, NextResponse } from "next/server";
import { analyzeRepositoryWithGemini } from "@/lib/ai/gemini-analysis";
import { getRepositoryAIAnalysis, saveRepositoryAIAnalysis } from "@/lib/redis/repository-cache";
import { parseGitHubRepository } from "@/lib/github/github-url";
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
                { status: 400 }
            );
        }
        const repository = parseGitHubRepository(repositoryUrl);
        if (!repository) {
            return NextResponse.json(
                {
                    error: "URL inválida do GitHub.",
                },
                { status: 400 }
            );
        }
        //Recupera a análise do Github salva no Redis
        const repositoryAnalysis = await findLatestRepositoryAnalysis(
            repository.owner,
            repository.repository
        );
        if (!repositoryAnalysis) {
            return NextResponse.json(
                {
                    error:
                        "A análise do repositório não foi encontrada no Redis.",
                },
                { status: 404 }
            );
        }
        const {
            sha,
            repository: repositoryData,
            files,
        } = repositoryAnalysis;
        //Verifica se o repositorio tem analise do Gemini
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
        //Envia para o gemini os arquivos processados pelo servidor
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
        // Salva a analise no redis por 24 horas
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
): Promise<RepositoryAnalysisCache & { sha: string } | null> {
    const { redis } = await import(
        "@/lib/redis/redis-client"
    );
    const pattern = `github-analyzer:analysis:${owner}:${repository}:*`;
    let cursor = "0";
    do {
        const result = await redis.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
        });
        cursor = result.cursor;
        if (result.keys.length > 0) {
            for (const key of result.keys) {
                const data = await getRepositoryAnalysisByKey(key);
                if (data) {
                    const sha = key.split(":").pop();
                    if (!sha) {
                        continue;
                    }
                    return {
                        ...data,
                        sha,
                    };
                }
            }
        }
    } while (cursor !== "0");
    return null;
}
async function getRepositoryAnalysisByKey(
    key: string
): Promise<RepositoryAnalysisCache | null> {
    const { getRedisJson } = await import(
        "@/lib/redis/redis-cache"
    );
    return getRedisJson<RepositoryAnalysisCache>(key);
}