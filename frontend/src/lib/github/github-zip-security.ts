import type JSZip from "jszip";
import { GITHUB_ANALYSIS_LIMITS } from "./github-analysis-limits";
function normalizeZipPath(path: string): string {
    return path
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");
}
function isUnsafeZipPath(path: string): boolean {
    const normalizedPath = normalizeZipPath(path);
    const segments = normalizedPath.split("/");
    return (
        segments.some((segment) => segment === "..") ||
        normalizedPath.startsWith("/") ||
        /^[a-zA-Z]:\//.test(normalizedPath)
    );
}
function getUncompressedSize(
    entry: JSZip.JSZipObject
): number {
    const data = (
        entry as JSZip.JSZipObject & {
            _data?: {
                uncompressedSize?: number;
            };
        }
    )._data;

    return data?.uncompressedSize ?? 0;
}
export function validateZipSecurity(
    zip: JSZip
): void {
    const entries = Object.values(zip.files);
    // Limita a quantidade total de entradas existentes dentro do ZIP
    if (
        entries.length >
        GITHUB_ANALYSIS_LIMITS.maxZipEntries
    ) {
        throw new Error(
            "O repositório contém arquivos demais para ser analisado."
        );
    }
    let totalUncompressedSize = 0;
    for (const entry of entries) {
        const normalizedPath =
            normalizeZipPath(entry.name);
        if (isUnsafeZipPath(normalizedPath)) {
            throw new Error(
                "O arquivo ZIP contém um caminho inválido."
            );
        }
        if (!normalizedPath) {
            throw new Error(
                "O arquivo ZIP contém uma entrada inválida."
            );
        }
        const uncompressedSize =
            getUncompressedSize(entry);
        if (
            !Number.isFinite(uncompressedSize) ||
            uncompressedSize < 0
        ) {
            throw new Error(
                "Não foi possível validar o tamanho de um arquivo do ZIP."
            );
        }
        // proteção contra zip bomb
        totalUncompressedSize +=
            uncompressedSize;
        if (
            totalUncompressedSize >
            GITHUB_ANALYSIS_LIMITS.maxUncompressedZipSize
        ) {
            throw new Error(
                "O conteúdo descomprimido do repositório excede o limite permitido."
            );
        }
    }
}