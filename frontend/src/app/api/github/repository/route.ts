import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

import {
    downloadRepositoryZip,
    getRepository,
    getRepositoryTree,
} from "@/lib/github/github-client";

import { parseGitHubRepository } from "@/lib/github/github-url";
import { filterRepositoryFiles } from "@/lib/github/github-file-filter";
import { processRepositoryFiles } from "@/lib/github/github-file-processor";
import { GITHUB_ANALYSIS_LIMITS } from "@/lib/github/github-analysis-limits";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const repositoryUrl = body.url;
        if (typeof repositoryUrl !== "string") {
            return NextResponse.json(
                {
                    error: "URL do repositório não informada.",
                },
                {
                    status: 400,
                }
            );
        }
        const repository = parseGitHubRepository(repositoryUrl);
        if (!repository) {
            return NextResponse.json(
                {
                    error: "URL inválida do GitHub.",
                },
                {
                    status: 400,
                }
            );
        }
        const repositoryData = await getRepository(repository);
        const repositorySizeInBytes = repositoryData.size * 1024;
        if (
            repositorySizeInBytes >
            GITHUB_ANALYSIS_LIMITS.maxZipSize
        ) {
            return NextResponse.json(
                {
                    error:
                        "Este repositório é muito grande para ser analisado. Estamos selecionando apenas os arquivos mais relevantes para a análise.",
                    code: "REPOSITORY_TOO_LARGE",
                    repository: repositoryData,
                },
                {
                    status: 413,
                }
            );
        }
        const branch = repositoryData.default_branch;
        const treeData = await getRepositoryTree(
            repository,
            branch
        );
        const relevantFiles = filterRepositoryFiles(
            treeData.tree
        );
        const zipBuffer = await downloadRepositoryZip(
            repository,
            branch
        );
        if (
            zipBuffer.byteLength >
            GITHUB_ANALYSIS_LIMITS.maxZipSize
        ) {
             return NextResponse.json(
                {
                    error:
                        "Este repositório é muito grande para ser analisado. Estamos selecionando apenas os arquivos mais relevantes para a análise.",
                    code: "REPOSITORY_TOO_LARGE",
                    repository: repositoryData,
                },
                {
                    status: 413,
                }
            );
        }
        const zip = await JSZip.loadAsync(
            zipBuffer
        );
        const processed = await processRepositoryFiles(
            zip,
            relevantFiles
        );
        const structure = {
            totalFiles: treeData.tree.length,
            relevantFiles: relevantFiles.length,
            analyzedFiles: processed.files.length,
            skippedFiles: processed.skippedFiles.length,
            truncated:
                treeData.truncated ||
                processed.truncated,
        };
        return NextResponse.json({
            repository: repositoryData,
            branch,
            structure,
            files: processed.files,
        });
    } catch (error) {
        console.error(
            "Erro ao consultar GitHub:",
            error
        );
        const message = error instanceof Error
                ? error.message
                : "Erro interno ao consultar o GitHub.";
        return NextResponse.json(
            {
                error: message,
            },
            {
                status: 500,
            }
        );
    }
}