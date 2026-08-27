import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

import {
    downloadRepositoryZip,
    getRepository,
    getRepositoryLanguages,
    getRepositoryTree,
} from "@/lib/github/github-client";

import { parseGitHubRepository } from "@/lib/github/github-url";
import { filterRepositoryFiles } from "@/lib/github/github-file-filter";
import { processRepositoryFiles } from "@/lib/github/github-file-processor";
import { GITHUB_ANALYSIS_LIMITS } from "@/lib/github/github-analysis-limits";
import { validateZipSecurity } from "@/lib/github/github-zip-security";

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

        const repository = parseGitHubRepository(
            repositoryUrl
        );

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

        const repositoryData =
            await getRepository(repository);

        const languages =
            await getRepositoryLanguages(
                repository
            );

        /**
         * O GitHub informa o tamanho do repositório
         * em KB.
         *
         * Fazemos essa validação ANTES de baixar
         * qualquer ZIP.
         */
        const repositorySizeInBytes =
            repositoryData.size * 1024;

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
                    languages,
                },
                {
                    status: 413,
                }
            );
        }

        const branch =
            repositoryData.default_branch;

        const treeData =
            await getRepositoryTree(
                repository,
                branch
            );

        const relevantFiles =
            filterRepositoryFiles(
                treeData.tree
            );

        const zipBuffer =
            await downloadRepositoryZip(
                repository,
                branch
            );

        /**
         * Segunda proteção.
         *
         * O tamanho informado pelo GitHub pode não
         * representar exatamente o tamanho final
         * do arquivo ZIP baixado.
         */
        if (
            zipBuffer.byteLength >
            GITHUB_ANALYSIS_LIMITS.maxZipSize
        ) {
            return NextResponse.json(
                {
                    error:
                        "O ZIP do repositório excede o tamanho máximo permitido.",
                    code: "ZIP_TOO_LARGE",
                    repository: repositoryData,
                    languages,
                },
                {
                    status: 413,
                }
            );
        }

        const zip =
            await JSZip.loadAsync(zipBuffer);

        /**
         * Proteção contra ZIP bombs,
         * path traversal e excesso de entradas.
         */
        validateZipSecurity(zip);

        const processed =
            await processRepositoryFiles(
                zip,
                relevantFiles
            );

        const structure = {
            totalFiles: treeData.tree.length,
            relevantFiles:
                relevantFiles.length,
            analyzedFiles:
                processed.files.length,
            skippedFiles:
                processed.skippedFiles.length,
            truncated:
                treeData.truncated ||
                processed.truncated,
        };

        const analysis = {
            limited:
                treeData.truncated ||
                processed.truncated ||
                processed.skippedFiles.length > 0,
            reason:
                treeData.truncated
                    ? "A árvore de arquivos do repositório foi limitada pelo GitHub."
                    : processed.truncated
                        ? "A análise foi limitada devido aos limites de processamento."
                        : processed.skippedFiles.length > 0
                            ? "Alguns arquivos foram ignorados por não serem relevantes para a análise."
                            : null,
        };

        return NextResponse.json({
            repository: repositoryData,
            languages,
            branch,
            structure,
            analysis,
            files: processed.files,
            skippedFiles:
                processed.skippedFiles,
        });
    } catch (error) {
        console.error(
            "Erro ao consultar GitHub:",
            error
        );

        const message =
            error instanceof Error
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