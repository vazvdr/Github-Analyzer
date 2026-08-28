const REDIS_PREFIX = "github-analyzer";

export function repositoryAnalysisKey(
    owner: string,
    repository: string,
    sha: string
): string {
    return `${REDIS_PREFIX}:analysis:${owner}:${repository}:${sha}`;
}

export function repositoryChunksKey(
    owner: string,
    repository: string,
    sha: string
): string {
    return `${REDIS_PREFIX}:chunks:${owner}:${repository}:${sha}`;
}

export function repositoryChatKey(
    owner: string,
    repository: string,
    sha: string
): string {
    return `${REDIS_PREFIX}:chat:${owner}:${repository}:${sha}`;
}