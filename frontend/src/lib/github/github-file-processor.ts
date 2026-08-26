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
    const fileName = normalizedPath.split("/").pop() ?? "";

    if (
        fileName === "package.json" ||
        fileName === "pom.xml" ||
        fileName === "build.gradle" ||
        fileName === "build.gradle.kts" ||
        fileName === "go.mod" ||
        fileName === "cargo.toml" ||
        fileName === "requirements.txt"
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
        fileName === "tsconfig.json" ||
        fileName === "jsconfig.json" ||
        fileName === "next.config.js" ||
        fileName === "next.config.mjs" ||
        fileName === "next.config.ts" ||
        fileName === "vite.config.js" ||
        fileName === "vite.config.ts" ||
        fileName === "webpack.config.js" ||
        fileName === "nest-cli.json"
    ) {
        return 93;
    }

    if (
        fileName === "index.ts" ||
        fileName === "index.tsx" ||
        fileName === "index.js" ||
        fileName === "index.jsx" ||
        fileName === "main.ts" ||
        fileName === "main.tsx" ||
        fileName === "main.js" ||
        fileName === "main.jsx" ||
        fileName === "app.ts" ||
        fileName === "app.tsx" ||
        fileName === "app.js" ||
        fileName === "app.jsx"
    ) {
        return 92;
    }

    if (
        fileName.includes("application") ||
        fileName.includes("config") ||
        fileName.includes("env") ||
        fileName.includes("settings")
    ) {
        return 90;
    }

    if (
        normalizedPath.includes("/controllers/") ||
        normalizedPath.includes("/controller/") ||
        normalizedPath.includes("/routes/") ||
        normalizedPath.includes("/route/") ||
        normalizedPath.includes("/api/")
    ) {
        return 85;
    }

    if (
        normalizedPath.includes("/services/") ||
        normalizedPath.includes("/service/") ||
        normalizedPath.includes("/usecases/") ||
        normalizedPath.includes("/use-cases/")
    ) {
        return 80;
    }

    if (
        normalizedPath.includes("/entities/") ||
        normalizedPath.includes("/entity/") ||
        normalizedPath.includes("/models/") ||
        normalizedPath.includes("/model/") ||
        normalizedPath.includes("/repositories/") ||
        normalizedPath.includes("/repository/")
    ) {
        return 75;
    }

    if (
        normalizedPath.includes("/components/") ||
        normalizedPath.includes("/pages/") ||
        normalizedPath.includes("/screens/") ||
        normalizedPath.includes("/views/")
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
        normalizedPath.includes("/middleware/") ||
        normalizedPath.includes("/middlewares/")
    ) {
        return 64;
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
        normalizedPath.endsWith(".rs") ||
        normalizedPath.endsWith(".cs") ||
        normalizedPath.endsWith(".php")
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
        normalizedPath.endsWith(".yml") ||
        normalizedPath.endsWith(".toml")
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
    const prioritizedFiles = [...files]
        .filter((file) => {
            const path = file.path.toLowerCase();

            return !(
                path.startsWith(".git/") ||
                path.includes("/node_modules/") ||
                path.startsWith("node_modules/") ||
                path.includes("/dist/") ||
                path.startsWith("dist/") ||
                path.includes("/build/") ||
                path.startsWith("build/") ||
                path.includes("/.next/") ||
                path.startsWith(".next/") ||
                path.includes("/coverage/") ||
                path.startsWith("coverage/") ||
                path.endsWith(".lock") ||
                path.endsWith(".map")
            );
        })
        .sort((a, b) => {
            const priorityDifference =
                getFilePriority(b.path) -
                getFilePriority(a.path);

            if (priorityDifference !== 0) {
                return priorityDifference;
            }

            return a.path.localeCompare(b.path);
        });

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
        const content = await zipFile.async("string");
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