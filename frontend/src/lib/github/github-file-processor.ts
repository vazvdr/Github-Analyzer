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

function getFilePriority(path: string): number {
    const normalizedPath = path.toLowerCase();

    const fileName =
        normalizedPath.split("/").pop() ?? "";

    if (
        fileName === "package.json" ||
        fileName === "pom.xml" ||
        fileName === "build.gradle" ||
        fileName === "build.gradle.kts"
    ) {
        return 100;
    }

    if (
        fileName === "readme.md" ||
        fileName === "dockerfile" ||
        fileName === "docker-compose.yml" ||
        fileName === "docker-compose.yaml"
    ) {
        return 95;
    }

    if (
        fileName.includes("application") ||
        fileName.includes("config")
    ) {
        return 90;
    }

    if (
        normalizedPath.includes("/controllers/") ||
        normalizedPath.includes("/routes/") ||
        normalizedPath.includes("/api/")
    ) {
        return 85;
    }

    if (
        normalizedPath.includes("/services/") ||
        normalizedPath.includes("/usecases/") ||
        normalizedPath.includes("/use-cases/")
    ) {
        return 80;
    }

    if (
        normalizedPath.includes("/entities/") ||
        normalizedPath.includes("/models/") ||
        normalizedPath.includes("/repositories/")
    ) {
        return 75;
    }

    if (
        normalizedPath.includes("/components/") ||
        normalizedPath.includes("/pages/") ||
        normalizedPath.includes("/screens/")
    ) {
        return 70;
    }

    if (
        normalizedPath.includes("/hooks/") ||
        normalizedPath.includes("/contexts/") ||
        normalizedPath.includes("/providers/")
    ) {
        return 65;
    }

    if (
        normalizedPath.includes("/config/") ||
        normalizedPath.includes("/configs/")
    ) {
        return 60;
    }

    if (
        normalizedPath.endsWith(".ts") ||
        normalizedPath.endsWith(".tsx") ||
        normalizedPath.endsWith(".js") ||
        normalizedPath.endsWith(".jsx") ||
        normalizedPath.endsWith(".java") ||
        normalizedPath.endsWith(".py") ||
        normalizedPath.endsWith(".go") ||
        normalizedPath.endsWith(".rs")
    ) {
        return 50;
    }

    if (
        normalizedPath.endsWith(".md") ||
        normalizedPath.endsWith(".mdx")
    ) {
        return 40;
    }

    if (
        normalizedPath.endsWith(".json") ||
        normalizedPath.endsWith(".yaml") ||
        normalizedPath.endsWith(".yml")
    ) {
        return 30;
    }

    if (
        normalizedPath.endsWith(".css") ||
        normalizedPath.endsWith(".scss") ||
        normalizedPath.endsWith(".sass") ||
        normalizedPath.endsWith(".less")
    ) {
        return 20;
    }

    return 10;
}

export async function processRepositoryFiles(
    zip: {
        files: Record<
            string,
            {
                async: (
                    type: "string"
                ) => Promise<string>;
            }
        >;
    },
    files: GitHubTreeItem[]
): Promise<GitHubFileProcessingResult> {
    const processedFiles: ProcessedGitHubFile[] = [];
    const skippedFiles: string[] = [];

    let totalSize = 0;
    let truncated = false;

    const prioritizedFiles = [...files].sort(
        (a, b) => {
            const priorityDifference =
                getFilePriority(b.path) -
                getFilePriority(a.path);

            if (priorityDifference !== 0) {
                return priorityDifference;
            }

            return a.path.localeCompare(b.path);
        }
    );

    for (const file of prioritizedFiles) {
        if (
            processedFiles.length >=
            GITHUB_ANALYSIS_LIMITS.maxRelevantFiles
        ) {
            truncated = true;
            skippedFiles.push(file.path);
            continue;
        }

        if (
            typeof file.size === "number" &&
            file.size >
                GITHUB_ANALYSIS_LIMITS.maxFileSize
        ) {
            skippedFiles.push(file.path);
            continue;
        }

        const zipEntry = Object.keys(
            zip.files
        ).find((path) =>
            path.endsWith(`/${file.path}`)
        );

        if (!zipEntry) {
            skippedFiles.push(file.path);
            continue;
        }

        const zipFile = zip.files[zipEntry];

        if (!zipFile) {
            skippedFiles.push(file.path);
            continue;
        }

        const content = await zipFile.async(
            "string"
        );

        const size = Buffer.byteLength(
            content,
            "utf-8"
        );

        if (
            size >
            GITHUB_ANALYSIS_LIMITS.maxFileSize
        ) {
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