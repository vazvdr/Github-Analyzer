"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GitHubRepositoryResponse, GitHubTreeItem } from "@/lib/github/github.types";
import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";
export function useDashboard() {
    const searchParams = useSearchParams();
    const [repository, setRepository] =
        useState<GitHubRepositoryResponse | null>(null);
    const [files, setFiles] = useState<GitHubTreeItem[]>([]);
    const [structure, setStructure] =
        useState<ProjectStructureProps["structure"]>(undefined);
    const [analysis, setAnalysis] =
        useState<ProjectStructureProps["analysis"]>(undefined);
    const [loading, setLoading] = useState(true);
    const repositoryUrl =
        searchParams.get("repository") ?? "";

    useEffect(() => {
        async function loadRepository() {
            try {
                setLoading(true);
                const storedRepository =
                    sessionStorage.getItem("github-repository");
                if (storedRepository) {
                    const parsedRepository =
                        JSON.parse(
                            storedRepository
                        ) as GitHubRepositoryResponse;
                    setRepository(parsedRepository);
                }
                if (!repositoryUrl) {
                    return;
                }
                const response = await fetch(
                    "/api/github/repository",
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
                if (!response.ok) {
                    return;
                }
                const data = await response.json();
                setRepository(data.repository);
                setFiles(data.files ?? []);
                setStructure(data.structure);
                setAnalysis(data.analysis);
            } finally {
                setLoading(false);
            }
        }
        loadRepository();
    }, [repositoryUrl]);
    const repositoryStats = repository
        ? [
              {
                  label: "Stars",
                  value:
                      repository.stargazers_count.toLocaleString(
                          "pt-BR"
                      ),
                  description: "Estrelas no GitHub",
              },
              {
                  label: "Forks",
                  value:
                      repository.forks_count.toLocaleString(
                          "pt-BR"
                      ),
                  description: "Forks do repositório",
              },
              {
                  label: "Linguagem",
                  value:
                      repository.language ??
                      "Não identificada",
                  description: "Principal linguagem",
              },
              {
                  label: "Branch",
                  value: repository.default_branch,
                  description: "Branch padrão",
              },
          ]
        : [];
    const technologies = repository?.language
        ? [repository.language]
        : [];
    const repositoryPath = repositoryUrl
        .replace("https://github.com/", "")
        .replace(/\/$/, "");
    const [owner] = repositoryPath.split("/");
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
    };
}
