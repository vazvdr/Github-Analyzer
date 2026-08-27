import type {
    GitHubRepository,
    GitHubRepositoryResponse,
    GitHubTreeResponse,
} from "./github.types";

const GITHUB_API_URL = "https://api.github.com";

const GITHUB_HEADERS = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
};

export async function getRepository(
    repository: GitHubRepository
): Promise<GitHubRepositoryResponse> {
    const response = await fetch(
        `${GITHUB_API_URL}/repos/${encodeURIComponent(
            repository.owner
        )}/${encodeURIComponent(repository.repository)}`,
        {
            headers: GITHUB_HEADERS,
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

export async function getRepositoryLanguages(
    repository: GitHubRepository
): Promise<string[]> {
    const response = await fetch(
        `${GITHUB_API_URL}/repos/${encodeURIComponent(
            repository.owner
        )}/${encodeURIComponent(repository.repository)
        }/languages`,
        {
            headers: GITHUB_HEADERS,
            cache: "no-store",
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(
                "Linguagens do repositório não encontradas."
            );
        }

        if (response.status === 403) {
            throw new Error(
                "Limite de requisições da API do GitHub atingido."
            );
        }

        throw new Error(
            `Erro ao consultar as linguagens do repositório. Status: ${response.status}`
        );
    }

    const languages = (await response.json()) as Record<
        string,
        number
    >;

    return Object.keys(languages);
}

export async function getRepositoryTree(
    repository: GitHubRepository,
    branch: string
): Promise<GitHubTreeResponse> {
    const response = await fetch(
        `${GITHUB_API_URL}/repos/${encodeURIComponent(
            repository.owner
        )}/${encodeURIComponent(repository.repository)
        }/git/trees/${encodeURIComponent(branch)}?recursive=1`,
        {
            headers: GITHUB_HEADERS,
            cache: "no-store",
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(
                "Árvore de arquivos do repositório não encontrada."
            );
        }

        if (response.status === 403) {
            throw new Error(
                "Limite de requisições da API do GitHub atingido."
            );
        }

        throw new Error(
            `Erro ao obter a árvore do repositório. Status: ${response.status}`
        );
    }

    return response.json();
}

export async function downloadRepositoryZip(
    repository: GitHubRepository,
    branch: string
): Promise<ArrayBuffer> {
    const response = await fetch(
        `https://github.com/${encodeURIComponent(
            repository.owner
        )}/${encodeURIComponent(
            repository.repository
        )}/archive/refs/heads/${encodeURIComponent(branch)}.zip`,
        {
            cache: "no-store",
            redirect: "follow",
        }
    );

    if (!response.ok) {
        throw new Error(
            `Erro ao baixar o ZIP do repositório. Status: ${response.status}`
        );
    }

    return response.arrayBuffer();
}