import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";

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

export interface GitHubAnalysisInfo {
    totalFiles: number;
    relevantFiles: number;
    analyzedFiles: number;
    skippedFiles: number;
    totalSize: number;
    maxFiles: number;
    maxFileSize: number;
    maxTotalContentSize: number;
    truncated: boolean;
    limited: boolean;
    reason?: string;
}

export interface GitHubAnalysisStructure {
    totalFiles: number;
    relevantFiles: number;
    analyzedFiles: number;
    skippedFiles: number;
    truncated: boolean;
}

export interface GitHubAnalysisData {
    repository: GitHubRepositoryResponse;
    languages: string[];
    branch: string; sha: string;
    structure: ProjectStructureProps["structure"];
    analysis: ProjectStructureProps["analysis"];
    files: GitHubTreeItem[];
    skippedFiles: string[];
}

export interface AIRepositoryAnalysis {
    overview: string;
    architecture: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}