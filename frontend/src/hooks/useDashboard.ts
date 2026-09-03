"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import type {
    AIRepositoryAnalysis,
    GitHubAnalysisData,
    GitHubRepositoryResponse,
    GitHubTreeItem,
} from "@/lib/github/github.types";

import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";

export function useDashboard() {
    const searchParams = useSearchParams();
    const { i18n } = useTranslation();

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

    const [loading, setLoading] = useState(true);

    const repositoryUrl =
        searchParams.get("repository") ?? "";

    const language =
        i18n.language?.split("-")[0] as
            | "pt"
            | "en"
            | "es";

    useEffect(() => {
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
            setTechnologies(data.languages ?? []);

            setAiAnalysis(
                data.aiAnalysis?.[language] ?? null
            );
        } catch (error) {
            console.error(
                "Erro ao carregar dashboard:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, [repositoryUrl, language]);

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
    };
}