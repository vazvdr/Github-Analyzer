import type {
    AIRepositoryAnalysis,
    GitHubAnalysisStructure,
    GitHubRepositoryResponse,
    GitHubTreeItem,
} from "@/lib/github/github.types";

import type { ProcessedGitHubFile } from "@/lib/github/github-file-processor";

export interface RepositoryAnalysisCache {
    repository: GitHubRepositoryResponse;
    languages: string[];
    branch: string;
    structure: GitHubAnalysisStructure;
    analysis: {
        limited: boolean;
        reason: string | null;
    };
    files: ProcessedGitHubFile[];
    skippedFiles: string[];
    createdAt: string;
}

export interface RepositoryChunk {
    id: string;
    repository: string;
    path: string;
    content: string;
    startLine?: number;
    endLine?: number;
}

export interface RepositoryChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

export interface RepositoryChatCache {
    repository: string;
    messages: RepositoryChatMessage[];
    updatedAt: string;
}

export interface RepositoryAIAnalysisCache {
    repository: GitHubRepositoryResponse;
    sha: string;
    analysis: AIRepositoryAnalysis;
    createdAt: string;
}