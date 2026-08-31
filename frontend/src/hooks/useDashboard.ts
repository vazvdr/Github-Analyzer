"use client";
import { useEffect, useState } from "react";
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
        useState<ProjectStructureProps["structure"]>(undefined);

    const [analysis, setAnalysis] =
        useState<ProjectStructureProps["analysis"]>(undefined);

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
                setFiles(data.files ?? []);
                setStructure(data.structure);
                setAnalysis(data.analysis);
                setTechnologies(
                    data.languages ?? []
                );
                //Pede a analise da IA só depois que o repo for analisado no servidor
                setAiLoading(true);

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
        loadDashboard();
    }, [repositoryUrl]);

    const repositoryStats = repository
        ? [
              {
                  label: "Stars",
                  value: repository.stargazers_count.toLocaleString(
                      "pt-BR"
                  ),
                  description:
                      "Estrelas no GitHub",
              },
              {
                  label: "Forks",
                  value: repository.forks_count.toLocaleString(
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

    const repositoryPath = repositoryUrl
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