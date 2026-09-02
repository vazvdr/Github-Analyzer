"use client";

import { useEffect, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import type {
    AIRepositoryAnalysis,
    GitHubAnalysisData,
    GitHubRepositoryResponse,
    GitHubTreeItem,
} from "@/lib/github/github.types";

import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";

export function useDashboard() {
    const searchParams = useSearchParams();

    const [repository, setRepository] =
        useState<GitHubRepositoryResponse | null>(null);

    const [files, setFiles] =
        useState<GitHubTreeItem[]>([]);

    const [structure, setStructure] =
        useState<ProjectStructureProps["structure"]>(
            undefined
        );

    const [analysis, setAnalysis] =
        useState<ProjectStructureProps["analysis"]>(
            undefined
        );

    const [technologies, setTechnologies] =
        useState<string[]>([]);

    const [aiAnalysis, setAiAnalysis] =
        useState<AIRepositoryAnalysis | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [aiLoading, setAiLoading] =
        useState(false);

    const [aiError, setAiError] =
        useState<string | null>(null);

    const repositoryUrl =
        searchParams.get("repository") ?? "";

    /*
     * Evita que o React Strict Mode, em desenvolvimento,
     * execute a mesma análise duas vezes.
     *
     * Guardamos a URL + SHA que já foram processados.
     */
    const aiRequestRef = useRef<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            const storedAnalysis =
                sessionStorage.getItem(
                    "github-analysis"
                );

            if (!storedAnalysis) {
                setLoading(false);
                return;
            }

            try {
                const data =
                    JSON.parse(
                        storedAnalysis
                    ) as GitHubAnalysisData;

                setRepository(data.repository);

                setFiles(
                    data.files ?? []
                );

                setStructure(
                    data.structure
                );

                setAnalysis(
                    data.analysis
                );

                setTechnologies(
                    data.languages ?? []
                );

                /*
                 * O SHA já foi gerado durante a análise
                 * do repositório e está salvo no
                 * sessionStorage.
                 */
                const sha = data.sha;

                if (!sha) {
                    throw new Error(
                        "SHA do repositório não encontrado."
                    );
                }

                /*
                 * Identificador único da análise.
                 *
                 * Se o Strict Mode montar o componente
                 * novamente, essa mesma combinação já
                 * terá sido registrada e a requisição
                 * não será repetida.
                 */
                const requestKey =
                    `${repositoryUrl}:${sha}`;

                if (
                    aiRequestRef.current ===
                    requestKey
                ) {
                    setLoading(false);
                    return;
                }

                aiRequestRef.current =
                    requestKey;

                /*
                 * Pede a análise da IA somente depois
                 * que o repositório foi analisado
                 * pelo servidor.
                 */
                setAiLoading(true);
                setAiError(null);

                const response =
                    await fetch(
                        "/api/github/ai-analysis",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                url: repositoryUrl,
                                sha,
                            }),
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ??
                            "Não foi possível analisar o repositório com IA."
                    );
                }

                setAiAnalysis(
                    result.analysis
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar dashboard:",
                    error
                );

                /*
                 * Permite uma nova tentativa caso
                 * a requisição tenha falhado.
                 */
                aiRequestRef.current = null;

                if (
                    error instanceof Error
                ) {
                    setAiError(
                        error.message
                    );
                } else {
                    setAiError(
                        "Erro ao analisar o repositório com IA."
                    );
                }
            } finally {
                setLoading(false);
                setAiLoading(false);
            }
        }

        void loadDashboard();
    }, [repositoryUrl]);

    const repositoryStats = repository
        ? [
              {
                  label: "Stars",
                  value:
                      repository.stargazers_count.toLocaleString(
                          "pt-BR"
                      ),
                  description:
                      "Estrelas no GitHub",
              },
              {
                  label: "Forks",
                  value:
                      repository.forks_count.toLocaleString(
                          "pt-BR"
                      ),
                  description:
                      "Forks do repositório",
              },
              {
                  label: "Linguagem",
                  value:
                      repository.language ??
                      "Não identificada",
                  description:
                      "Principal linguagem",
              },
              {
                  label: "Branch",
                  value:
                      repository.default_branch,
                  description:
                      "Branch padrão",
              },
          ]
        : [];

    const repositoryPath =
        repositoryUrl
            .replace(
                "https://github.com/",
                ""
            )
            .replace(/\/$/, "");

    const [owner] =
        repositoryPath.split("/");

    return {
        repository,
        files,
        structure,
        analysis,
        loading,
        repositoryUrl,
        repositoryStats,
        technologies,
        owner: owner ?? "",
        aiAnalysis,
        aiLoading,
        aiError,
    };
}