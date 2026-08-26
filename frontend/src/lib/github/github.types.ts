export interface GitHubRepository {
    owner: string;
    repository: string;
}

export interface GitHubRepositoryResponse {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    default_branch: string;
    size: number;
}

export interface GitHubTreeItem {
    path: string;
    mode: string;
    type: "blob" | "tree" | "commit";
    sha: string;
    size?: number;
    url: string;
}

export interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}