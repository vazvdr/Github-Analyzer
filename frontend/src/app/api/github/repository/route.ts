import { NextRequest, NextResponse } from "next/server";
import { getRepository, getRepositoryTree } from "@/lib/github/github-client";
import { parseGitHubRepository } from "@/lib/github/github-url";

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
        const branch = repositoryData.default_branch;
        const treeData = await getRepositoryTree(
            repository,
            branch
        );
        return NextResponse.json({
            repository: repositoryData,
            branch,
            tree: treeData,
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