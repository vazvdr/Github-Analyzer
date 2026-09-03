import type { ProcessedGitHubFile } from "./github-file-processor";
import type { RepositoryChunk } from "@/lib/redis/redis.types";

const CHUNK_SIZE_LINES = 100;
const CHUNK_OVERLAP_LINES = 10;

export function createRepositoryChunks(
    repository: string,
    files: ProcessedGitHubFile[]
): RepositoryChunk[] {
    const chunks: RepositoryChunk[] = [];

    for (const file of files) {
        const lines = file.content.split(/\r?\n/);

        if (lines.length === 0) {
            continue;
        }

        let startLine = 0;

        while (startLine < lines.length) {
            const endLine = Math.min(
                startLine + CHUNK_SIZE_LINES,
                lines.length
            );

            const content = lines
                .slice(startLine, endLine)
                .join("\n");

            if (content.trim()) {
                chunks.push({
                    id: `${file.path}:${startLine + 1}-${endLine}`,
                    repository,
                    path: file.path,
                    content,
                    startLine: startLine + 1,
                    endLine,
                });
            }

            if (endLine >= lines.length) {
                break;
            }

            startLine =
                endLine - CHUNK_OVERLAP_LINES;
        }
    }

    return chunks;
}