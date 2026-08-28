"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
    GitHubAnalysisData,
    GitHubRepositoryResponse,
    GitHubTreeItem,
} from "@/lib/github/github.types";
import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";

export function useDashboard() {
    const searchParams = useSearchParams();
    const [repository, setRepository] = useState<GitHubRepositoryResponse | null>(null);
    const [files, setFiles] = useState<GitHubTreeItem[]>([]);
    const [structure, setStructure] = useState<ProjectStructureProps["structure"]>(undefined);
    const [analysis, setAnalysis] = useState<ProjectStructureProps["analysis"]>(undefined);
    const [technologies, setTechnologies] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const repositoryUrl = searchParams.get("repository") ?? "";

    useEffect(() => {
        // O dashboard apenas recupera o resultado salvo pelo useHero.
        const storedAnalysis = sessionStorage.getItem("github-analysis");

        if (!storedAnalysis) {
            setLoading(false);
            return;
        }

        try {
            const data = JSON.parse(storedAnalysis) as GitHubAnalysisData;
            setRepository(data.repository);
            setFiles(data.files ?? []);
            setStructure(data.structure);
            setAnalysis(data.analysis);
            setTechnologies(data.languages ?? []);
        } catch (error) {
            console.error("Erro ao recuperar análise do repositório:", error);
            sessionStorage.removeItem("github-analysis");
        } finally {
            setLoading(false);
        }
    }, []);

    const repositoryStats = repository
        ? [
            {
                label: "Stars",
                value: repository.stargazers_count.toLocaleString("pt-BR"),
                description: "Estrelas no GitHub",
            },
            {
                label: "Forks",
                value: repository.forks_count.toLocaleString("pt-BR"),
                description: "Forks do repositório",
            },
            {
                label: "Linguagem",
                value: repository.language ?? "Não identificada",
                description: "Principal linguagem",
            },
            {
                label: "Branch",
                value: repository.default_branch,
                description: "Branch padrão",
            },
        ]
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