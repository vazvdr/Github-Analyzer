import type { GitHubTreeItem } from "./github.types";
import { GITHUB_ANALYSIS_LIMITS } from "./github-analysis-limits";

export interface ProcessedGitHubFile {
    path: string;
    content: string;
    size: number;
}

export interface GitHubFileProcessingResult {
    files: ProcessedGitHubFile[];
    skippedFiles: string[];
    totalSize: number;
    truncated: boolean;
}

export async function processRepositoryFiles(
    zip: {
        files: Record<
            string,
            {
                async: (type: "string") => Promise<string>;
            }
        >;
    },
    files: GitHubTreeItem[]
): Promise<GitHubFileProcessingResult> {
    const processedFiles: ProcessedGitHubFile[] = [];
    const skippedFiles: string[] = [];

    let totalSize = 0;
    let truncated = false;

    for (const file of files) {
        if (
            processedFiles.length >=
            GITHUB_ANALYSIS_LIMITS.maxRelevantFiles
        ) {
            truncated = true;
            skippedFiles.push(file.path);
            continue;
        }

        if (
            file.size &&
            file.size > GITHUB_ANALYSIS_LIMITS.maxFileSize
        ) {
            skippedFiles.push(file.path);
            continue;
        }

        const zipEntry = Object.keys(zip.files).find((path) =>
            path.endsWith(`/${file.path}`)
        );

        if (!zipEntry) {
            skippedFiles.push(file.path);
            continue;
        }

        const content = await zip.files[zipEntry].async("string");
        const size = Buffer.byteLength(content, "utf-8");

        if (size > GITHUB_ANALYSIS_LIMITS.maxFileSize) {
            skippedFiles.push(file.path);
            continue;
        }

        if (
            totalSize + size >
            GITHUB_ANALYSIS_LIMITS.maxTotalContentSize
        ) {
            truncated = true;
            skippedFiles.push(file.path);
            continue;
        }

        processedFiles.push({
            path: file.path,
            content,
            size,
        });

        totalSize += size;
    }

    return {
        files: processedFiles,
        skippedFiles,
        totalSize,
        truncated,
    };
}