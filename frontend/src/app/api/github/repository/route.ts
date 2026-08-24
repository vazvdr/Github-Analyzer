import { NextResponse } from "next/server";
import { parseGitHubRepository } from "@/lib/github/github-url";
import { getRepository } from "@/lib/github/github-client";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const url = body?.url;

        if (typeof url !== "string") {
            return NextResponse.json(
                {
                    message: "A URL do repositório é obrigatória.",
                },
                {
                    status: 400,
                }
            );
        }

        const repository = parseGitHubRepository(url);

        if (!repository) {
            return NextResponse.json(
                {
                    message:
                        "Informe uma URL válida de um repositório do GitHub.",
                },
                {
                    status: 400,
                }
            );
        }

        const data = await getRepository(repository);

        return NextResponse.json({
            repository: data,
        });
    } catch (error) {
        console.error("Erro ao consultar GitHub:", error);

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    message: error.message,
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                message: "Erro interno ao consultar o GitHub.",
            },
            {
                status: 500,
            }
        );
    }
}