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

/*
 * Normaliza e valida o caminho vindo do GitHub/ZIP.
 */
function normalizeSafePath(path: string): string | null {
    const normalized = path
        .replace(/\\/g, "/")
        .trim();
    if (!normalized) {
        return null;
    }
    if (normalized.startsWith("/")) {
        return null;
    }
    if (/^[a-zA-Z]:\//.test(normalized)) {
        return null;
    }
    const segments = normalized.split("/");
    if (
        segments.some(
            (segment) =>
                segment === ".." ||
                segment === "."
        )
    ) {
        return null;
    }
    return segments.join("/");
}
/*
 * Verifica se o caminho do ZIP corresponde exatamente
 * ao arquivo que veio da árvore do GitHub.
*/
function findZipEntry(
    zipFiles: Record<
        string,
        {
            async: (
                type: "string"
            ) => Promise<string>;
            dir?: boolean;
        }
    >,
    repositoryPath: string
): string | null {
    const safePath = normalizeSafePath(repositoryPath);
    if (!safePath) {
        return null;
    }
    const entries = Object.keys(zipFiles);
    for (const entry of entries) {
        const normalizedEntry = entry.replace(
            /\\/g,
            "/"
        );
        if (
            normalizedEntry === safePath ||
            normalizedEntry.endsWith(`/${safePath}`)
        ) {
            return normalizedEntry;
        }
    }
    return null;
}
export async function processRepositoryFiles(
    zip: {
        files: Record<
            string,
            {
                async: (
                    type: "string"
                ) => Promise<string>;
                dir?: boolean;
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
            const safePath = normalizeSafePath(
                file.path
            );

            if (!safePath) {
                skippedFiles.push(file.path);
                return false;
            }

            const path = safePath.toLowerCase();

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
        const safePath = normalizeSafePath(
            file.path
        );
        if (!safePath) {
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
        const zipEntry = findZipEntry(
            zip.files,
            safePath
        );
        if (!zipEntry) {
            skippedFiles.push(file.path);
            continue;
        }
        const zipFile = zip.files[zipEntry];
        if (!zipFile || zipFile.dir) {
            skippedFiles.push(file.path);
            continue;
        }
        //Faz apenas a leitura como texto e nunca executa
        let content: string;
        try {
            content = await zipFile.async("string");
        } catch (error) {
            console.warn(
                `Não foi possível ler o arquivo ${safePath}:`,
                error
            );
            skippedFiles.push(safePath);
            continue;
        }
        const size = Buffer.byteLength(
            content,
            "utf-8"
        );
        if (
            size >
            GITHUB_ANALYSIS_LIMITS.maxFileSize
        ) {
            skippedFiles.push(safePath);
            continue;
        }
        if (
            totalSize + size >
            GITHUB_ANALYSIS_LIMITS.maxTotalContentSize
        ) {
            truncated = true;
            skippedFiles.push(safePath);
            continue;
        }
        processedFiles.push({
            path: safePath,
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