import {
    deleteRedisKey,
    getRedisJson,
    setRedisJson,
} from "./redis-cache";
import {
    repositoryAIAnalysisKey,
    repositoryAnalysisKey,
    repositoryChatKey,
    repositoryChunksKey,
} from "./redis-keys";
import type {
    RepositoryAIAnalysisCache,
    RepositoryAnalysisCache,
    RepositoryChatCache,
    RepositoryChunk,
} from "./redis.types";

const REDIS_TTL_SECONDS = 60 * 60 * 24;

export async function saveRepositoryAnalysis(
    owner: string,
    repository: string,
    sha: string,
    data: RepositoryAnalysisCache
): Promise<void> {
    await setRedisJson(
        repositoryAnalysisKey(owner, repository, sha),
        data,
        REDIS_TTL_SECONDS
    );
}

export async function getRepositoryAnalysis(
    owner: string,
    repository: string,
    sha: string
): Promise<RepositoryAnalysisCache | null> {
    return getRedisJson<RepositoryAnalysisCache>(
        repositoryAnalysisKey(owner, repository, sha)
    );
}

export async function deleteRepositoryAnalysis(
    owner: string,
    repository: string,
    sha: string
): Promise<void> {
    await deleteRedisKey(repositoryAnalysisKey(owner, repository, sha));
}

export async function saveRepositoryChunks(
    owner: string,
    repository: string,
    sha: string,
    chunks: RepositoryChunk[]
): Promise<void> {
    await setRedisJson(
        repositoryChunksKey(owner, repository, sha),
        chunks,
        REDIS_TTL_SECONDS
    );
}

export async function getRepositoryChunks(
    owner: string,
    repository: string,
    sha: string
): Promise<RepositoryChunk[] | null> {
    return getRedisJson<RepositoryChunk[]>(
        repositoryChunksKey(owner, repository, sha)
    );
}

export async function deleteRepositoryChunks(
    owner: string,
    repository: string,
    sha: string
): Promise<void> {
    await deleteRedisKey(repositoryChunksKey(owner, repository, sha));
}

export async function saveRepositoryChat(
    owner: string,
    repository: string,
    sha: string,
    chat: RepositoryChatCache
): Promise<void> {
    await setRedisJson(
        repositoryChatKey(owner, repository, sha),
        chat,
        REDIS_TTL_SECONDS
    );
}

export async function getRepositoryChat(
    owner: string,
    repository: string,
    sha: string
): Promise<RepositoryChatCache | null> {
    return getRedisJson<RepositoryChatCache>(
        repositoryChatKey(owner, repository, sha)
    );
}

export async function deleteRepositoryChat(
    owner: string,
    repository: string,
    sha: string
): Promise<void> {
    await deleteRedisKey(repositoryChatKey(owner, repository, sha));
}

export async function saveRepositoryAIAnalysis(
    owner: string,
    repository: string,
    sha: string,
    data: RepositoryAIAnalysisCache
): Promise<void> {
    await setRedisJson(
        repositoryAIAnalysisKey(owner, repository, sha),
        data,
        REDIS_TTL_SECONDS
    );
}

export async function getRepositoryAIAnalysis(
    owner: string,
    repository: string,
    sha: string
): Promise<RepositoryAIAnalysisCache | null> {
    return getRedisJson<RepositoryAIAnalysisCache>(
        repositoryAIAnalysisKey(owner, repository, sha)
    );
}