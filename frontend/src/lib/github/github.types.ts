export interface GitHubRepository {
    owner: string;
    repository: string;
}

export interface GitHubRepositoryResponse {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
        avatar_url: string;
        html_url: string;
    };
    private: boolean;
    html_url: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    default_branch: string;
    size: number;
    open_issues_count: number;
    topics: string[];
    created_at: string;
    updated_at: string;
    pushed_at: string | null;
}