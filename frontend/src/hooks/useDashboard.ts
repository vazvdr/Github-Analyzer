"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type {
    AIRepositoryAnalysisTranslation,
    GitHubAnalysisData,
    GitHubRepositoryResponse,
    GitHubTreeItem,
} from "@/lib/github/github.types";
import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";
type SupportedLanguage = "pt" | "en" | "es";
function normalizeLanguage(
    language: string | undefined
): SupportedLanguage {
    const normalized = language?.split("-")[0];
    if (
        normalized === "en" ||
        normalized === "es"
    ) {
        return normalized;
    }
    return "pt";
}
export function useDashboard() {
    const searchParams = useSearchParams();
    const { i18n } = useTranslation();
    const [repository, setRepository] =
        useState<GitHubRepositoryResponse | null>(
            null
        );
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
        useState<AIRepositoryAnalysisTranslation | null>(
            null
        );
    const [loading, setLoading] =
        useState(true);
    const [initialLanguage, setInitialLanguage] =
        useState<SupportedLanguage>("pt");
    const repositoryUrl =
        searchParams.get("repository") ?? "";
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
            const savedInitialLanguage =
                normalizeLanguage(
                    data.initialLanguage
                );
            setInitialLanguage(
                savedInitialLanguage
            );
            setRepository(data.repository);
            setFiles(data.files ?? []);
            setStructure(data.structure);
            setAnalysis(data.analysis);
            setTechnologies(
                data.languages ?? []
            );
            const selectedAnalysis =
                data.aiAnalysis?.[
                    savedInitialLanguage
                ] ?? null;
            setAiAnalysis(
                selectedAnalysis
            );
        } catch (error) {
            console.error(
                "Erro ao carregar dashboard:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, [repositoryUrl]);
    useEffect(() => {
        function handleLanguageChange(
            language: string
        ) {
            const normalizedLanguage =
                normalizeLanguage(language);

            const storedAnalysis =
                sessionStorage.getItem(
                    "github-analysis"
                );
            if (!storedAnalysis) {
                return;
            }
            try {
                const data =
                    JSON.parse(
                        storedAnalysis
                    ) as GitHubAnalysisData;
                const selectedAnalysis =
                    data.aiAnalysis?.[
                        normalizedLanguage
                    ] ?? null;
                setAiAnalysis(
                    selectedAnalysis
                );
            } catch (error) {
                console.error(
                    "Erro ao atualizar idioma da análise:",
                    error
                );
            }
        }
        i18n.on(
            "languageChanged",
            handleLanguageChange
        );
        return () => {
            i18n.off(
                "languageChanged",
                handleLanguageChange
            );
        };
    }, [i18n]);
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
        initialLanguage,
    };
}