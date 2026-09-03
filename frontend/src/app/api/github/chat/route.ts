import { NextRequest, NextResponse } from "next/server";

import { chatWithRepositoryUsingGemini } from "@/lib/ai/gemini-chat";
import { parseGitHubRepository } from "@/lib/github/github-url";
import {
    getRepositoryChat,
    getRepositoryChunks,
    saveRepositoryChat,
} from "@/lib/redis/repository-cache";

import type {
    RepositoryAnalysisCache,
    RepositoryChatMessage,
    RepositoryChunk,
} from "@/lib/redis/redis.types";

type ChatLanguage = "pt" | "en" | "es";

interface ChatRequestBody {
    url: string;
    message: string;
    language: ChatLanguage;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as Partial<ChatRequestBody>;
        const repositoryUrl = body.url;
        const message = body.message?.trim();
        const language = body.language;

        if (typeof repositoryUrl !== "string") {
            return NextResponse.json(
                { error: "URL do repositório não informada." },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { error: "A pergunta não pode estar vazia." },
                { status: 400 }
            );
        }

        if (language !== "pt" && language !== "en" && language !== "es") {
            return NextResponse.json(
                { error: "Idioma de resposta inválido." },
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

        const repositoryAnalysis = await findLatestRepositoryAnalysis(
            repository.owner,
            repository.repository
        );

        if (!repositoryAnalysis) {
            return NextResponse.json(
                { error: "A análise do repositório não foi encontrada no Redis." },
                { status: 404 }
            );
        }

        const { sha, repository: repositoryData, aiAnalysis } = repositoryAnalysis;

        let chunks = await getRepositoryChunks(
            repository.owner,
            repository.repository,
            sha
        );

        if (!chunks) {
            return NextResponse.json(
                { error: "Os chunks do repositório não foram encontrados no Redis." },
                { status: 404 }
            );
        }

        chunks = getRelevantChunks(chunks, message);

        const cachedChat = await getRepositoryChat(
            repository.owner,
            repository.repository,
            sha
        );

        const previousMessages = cachedChat?.messages ?? [];

        const history = previousMessages.map((chatMessage) => ({
            role: chatMessage.role,
            content: chatMessage.content,
        }));

        const answer = await chatWithRepositoryUsingGemini(
            repositoryData.full_name,
            message,
            language,
            aiAnalysis?.[language] ?? null,
            chunks,
            history
        );
        const now = new Date().toISOString();
        const userMessage: RepositoryChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
            createdAt: now,
        };
        const assistantMessage: RepositoryChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: answer,
            createdAt: now,
        };
        const updatedMessages = [
            ...previousMessages,
            userMessage,
            assistantMessage,
        ];
        await saveRepositoryChat(
            repository.owner,
            repository.repository,
            sha,
            {
                repository: repositoryData.full_name,
                messages: updatedMessages,
                updatedAt: now,
            }
        );
        return NextResponse.json(
            {
                message: assistantMessage,
                messages: updatedMessages,
                sha,
            },
            {
                headers: {
                    "X-Repository-SHA": sha,
                    "X-RAG-Chunks": String(chunks.length),
                },
            }
        );
    } catch (error) {
        console.error("Erro ao conversar com o repositório:", error);
        const message =
            error instanceof Error
                ? error.message
                : "Erro interno ao conversar com o repositório.";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
function getRelevantChunks(
    chunks: RepositoryChunk[],
    question: string
): RepositoryChunk[] {
    const normalizedQuestion = normalizeText(question);
    const terms = normalizedQuestion
        .split(/[^a-z0-9_/-]+/)
        .filter((term) => term.length >= 3);
    if (terms.length === 0) {
        return chunks.slice(0, 6);
    }
    return chunks
        .map((chunk) => {
            const path = normalizeText(chunk.path);
            const content = normalizeText(chunk.content);
            let score = 0;

            for (const term of terms) {
                if (path.includes(term)) {
                    score += 10;
                }
                const occurrences = content.split(term).length - 1;
                score += Math.min(occurrences, 5);
            }
            return { chunk, score };
        })
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.chunk.path.localeCompare(b.chunk.path);
        })
        .slice(0, 6)
        .map(({ chunk }) => chunk);
}
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
async function findLatestRepositoryAnalysis(
    owner: string,
    repository: string
): Promise<(RepositoryAnalysisCache & { sha: string }) | null> {
    const { redis } = await import("@/lib/redis/redis-client");
    const pattern = `github-analyzer:analysis:${owner}:${repository}:*`;
    let cursor = "0";
    do {
        const result = await redis.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
        });
        cursor = result.cursor;
        for (const key of result.keys) {
            const data = await getRepositoryAnalysisByKey(key);
            if (!data) {
                continue;
            }
            const sha = key.split(":").pop();
            if (!sha) {
                continue;
            }
            return { ...data, sha };
        }
    } while (cursor !== "0");
    return null;
}

async function getRepositoryAnalysisByKey(
    key: string
): Promise<RepositoryAnalysisCache | null> {
    const { getRedisJson } = await import("@/lib/redis/redis-cache");
    return getRedisJson<RepositoryAnalysisCache>(key);
}