import type {
    GitHubRepository,
    GitHubRepositoryResponse,
} from "./github.types";

const GITHUB_API_URL = "https://api.github.com";

export async function getRepository(
    repository: GitHubRepository
): Promise<GitHubRepositoryResponse> {
    const response = await fetch(
        `${GITHUB_API_URL}/repos/${encodeURIComponent(
            repository.owner
        )}/${encodeURIComponent(repository.repository)}`,
        {
            headers: {
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Repositório não encontrado.");
        }

        if (response.status === 403) {
            throw new Error(
                "Limite de requisições da API do GitHub atingido."
            );
        }

        throw new Error(
            `Erro ao consultar o GitHub. Status: ${response.status}`
        );
    }

    return response.json();
}