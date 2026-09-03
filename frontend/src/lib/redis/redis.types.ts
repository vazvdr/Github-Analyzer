import type {
    AIRepositoryAnalysis,
    GitHubAnalysisStructure,
    GitHubRepositoryResponse,
} from "@/lib/github/github.types";

import type { ProcessedGitHubFile } from "@/lib/github/github-file-processor";
export type SupportedLanguage = "pt" | "en" | "es";

export interface RepositoryAnalysisCache {
    repository: GitHubRepositoryResponse;
    languages: string[];
    branch: string;
    sha: string;
    structure: GitHubAnalysisStructure;
    analysis: {
        limited: boolean;
        reason: string | null;
    };
    files: ProcessedGitHubFile[];
    skippedFiles: string[];
    aiAnalysis: {
        pt: AIRepositoryAnalysis | null;
        en: AIRepositoryAnalysis | null;
        es: AIRepositoryAnalysis | null;
    };
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