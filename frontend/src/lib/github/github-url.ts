import type { GitHubRepository } from "./github.types";

const GITHUB_REPOSITORY_REGEX =
    /^https:\/\/github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/([a-zA-Z0-9._-]+)\/?$/;

export function parseGitHubRepository(
    url: string
): GitHubRepository | null {
    const normalizedUrl = url.trim();

    const match = normalizedUrl.match(
        GITHUB_REPOSITORY_REGEX
    );

    if (!match) {
        return null;
    }

    const [, owner, repository] = match;

    return {
        owner,
        repository,
    };
}

export function isValidGitHubRepositoryUrl(
    url: string
): boolean {
    return parseGitHubRepository(url) !== null;
}