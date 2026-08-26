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

export function filterRepositoryFiles(
    tree: GitHubTreeItem[]
): GitHubTreeItem[] {
    return tree.filter((item) => {
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

        if (ALLOWED_FILES.includes(fileName) && isRootFile(path)) {
            return true;
        }

        if (!isRelevantDirectory(path)) {
            return false;
        }

        return isAllowedFile(path);
    });
}