import type { GitHubTreeItem } from "./github.types";

const RELEVANT_DIRECTORIES = [
    "src/",
    "app/",
    "pages/",
    "components/",
    "hooks/",
    "services/",
    "lib/",
    "utils/",
    "contexts/",
    "providers/",
    "store/",
    "stores/",
    "routes/",
    "controllers/",
    "modules/",
    "entities/",
    "repositories/",
    "middleware/",
    "config/",
    "configs/",
    "api/",
    "server/",
    "database/",
    "db/",
];

const ALLOWED_FILES = [
    "package.json",
    "tsconfig.json",
    "jsconfig.json",
    "next.config.js",
    "next.config.mjs",
    "next.config.ts",
    "vite.config.js",
    "vite.config.ts",
    "tailwind.config.js",
    "tailwind.config.ts",
    "postcss.config.js",
    "postcss.config.mjs",
    "eslint.config.js",
    "eslint.config.mjs",
    "dockerfile",
    "readme.md",
    ".gitignore",
    ".dockerignore",
    "docker-compose.yml",
    "docker-compose.yaml",
];

const ALLOWED_EXTENSIONS = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".py",
    ".java",
    ".kt",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".cs",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".html",
    ".md",
    ".mdx",
    ".json",
    ".yaml",
    ".yml",
    ".xml",
    ".toml",
    ".ini",
];

const IGNORED_DIRECTORIES = [
    "node_modules/",
    ".git/",
    ".next/",
    "dist/",
    "build/",
    "coverage/",
    "out/",
    ".turbo/",
    ".cache/",
    "vendor/",
    "__pycache__/",
    ".venv/",
    "venv/",
    "target/",
    "bin/",
    "obj/",
];

const IGNORED_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".svg",
    ".bmp",
    ".tiff",
    ".mp4",
    ".webm",
    ".mp3",
    ".wav",
    ".ogg",
    ".avi",
    ".mov",
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz",
    ".pdf",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
];

const IGNORED_FILES = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
];

function normalizePath(path: string): string {
    return path.trim().toLowerCase().replace(/\\/g, "/");
}

function isIgnoredDirectory(path: string): boolean {
    const normalizedPath = normalizePath(path);

    return IGNORED_DIRECTORIES.some(
        (directory) =>
            normalizedPath.startsWith(directory) ||
            normalizedPath.includes(`/${directory}`)
    );
}

function isIgnoredExtension(path: string): boolean {
    const normalizedPath = normalizePath(path);

    return IGNORED_EXTENSIONS.some((extension) =>
        normalizedPath.endsWith(extension)
    );
}

function isAllowedExtension(path: string): boolean {
    const normalizedPath = normalizePath(path);

    return ALLOWED_EXTENSIONS.some((extension) =>
        normalizedPath.endsWith(extension)
    );
}

function isRootFile(path: string): boolean {
    return !path.includes("/");
}

function isRelevantDirectory(path: string): boolean {
    const normalizedPath = normalizePath(path);

    return RELEVANT_DIRECTORIES.some((directory) => {
        const normalizedDirectory = directory.replace(/\/$/, "");

        return (
            normalizedPath.startsWith(`${normalizedDirectory}/`) ||
            normalizedPath.includes(`/${normalizedDirectory}/`)
        );
    });
}

function isAllowedFile(path: string): boolean {
    const normalizedPath = normalizePath(path);
    const fileName = normalizedPath.split("/").pop() ?? "";

    if (ALLOWED_FILES.includes(fileName)) {
        return true;
    }

    return isAllowedExtension(normalizedPath);
}

function getFilePriority(file: GitHubTreeItem): number {
    const path = normalizePath(file.path);
    const fileName = path.split("/").pop() ?? "";

    if (fileName === "package.json") {
        return 1000;
    }

    if (
        fileName === "readme.md" ||
        fileName === "dockerfile" ||
        fileName === "docker-compose.yml" ||
        fileName === "docker-compose.yaml"
    ) {
        return 950;
    }

    if (
        fileName === "tsconfig.json" ||
        fileName === "jsconfig.json" ||
        fileName === "next.config.js" ||
        fileName === "next.config.mjs" ||
        fileName === "next.config.ts" ||
        fileName === "vite.config.js" ||
        fileName === "vite.config.ts"
    ) {
        return 900;
    }

    if (
        path.includes("/controllers/") ||
        path.includes("/routes/") ||
        path.includes("/api/")
    ) {
        return 850;
    }

    if (
        path.includes("/services/") ||
        path.includes("/modules/")
    ) {
        return 800;
    }

    if (
        path.includes("/repositories/") ||
        path.includes("/database/") ||
        path.includes("/db/")
    ) {
        return 780;
    }

    if (
        path.includes("/entities/") ||
        path.includes("/models/")
    ) {
        return 760;
    }

    if (
        path.includes("/middleware/") ||
        path.includes("/config/") ||
        path.includes("/configs/")
    ) {
        return 740;
    }

    if (
        path.includes("/contexts/") ||
        path.includes("/providers/") ||
        path.includes("/store/") ||
        path.includes("/stores/")
    ) {
        return 720;
    }

    if (
        path.includes("/hooks/") ||
        path.includes("/utils/") ||
        path.includes("/lib/")
    ) {
        return 700;
    }

    if (
        path.includes("/components/") ||
        path.includes("/pages/") ||
        path.includes("/app/")
    ) {
        return 650;
    }

    if (path.startsWith("src/")) {
        return 600;
    }

    if (isRootFile(path)) {
        return 500;
    }

    if (isAllowedExtension(path)) {
        return 300;
    }

    return 0;
}

export function filterRepositoryFiles(
    tree: GitHubTreeItem[]
): GitHubTreeItem[] {
    const candidates = tree.filter((item) => {
        if (item.type !== "blob") {
            return false;
        }

        const path = normalizePath(item.path);
        const fileName = path.split("/").pop() ?? "";

        if (isIgnoredDirectory(path)) {
            return false;
        }

        if (IGNORED_FILES.includes(fileName)) {
            return false;
        }

        if (isIgnoredExtension(path)) {
            return false;
        }

        if (
            ALLOWED_FILES.includes(fileName) &&
            isRootFile(path)
        ) {
            return true;
        }

        if (!isRelevantDirectory(path)) {
            return false;
        }

        return isAllowedFile(path);
    });

    return candidates.sort((a, b) => {
        const priorityDifference =
            getFilePriority(b) - getFilePriority(a);

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        const sizeA = a.size ?? 0;
        const sizeB = b.size ?? 0;

        return sizeA - sizeB;
    });
}