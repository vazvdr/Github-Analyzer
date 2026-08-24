"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ArchitectureAnalysis } from "@/components/dashboard/ArchitectureAnalysis";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectStructure } from "@/components/dashboard/ProjectStructure";
import { RepositoryChat } from "@/components/dashboard/RepositoryChat";
import { RepositoryHeader } from "@/components/dashboard/RepositoryHeader";
import { RepositoryStats } from "@/components/dashboard/RepositoryStats";
import { Technologies } from "@/components/dashboard/Technologies";
import { ButtonTop } from "@/components/shared/ButtonTop";

import type { GitHubRepositoryResponse } from "@/lib/github/github.types";

export default function DashboardContent() {
    const searchParams = useSearchParams();

    const [repository, setRepository] =
        useState<GitHubRepositoryResponse | null>(null);

    const [loading, setLoading] = useState(true);

    const repositoryUrl =
        searchParams.get("repository") ?? "";

    useEffect(() => {
        const storedRepository =
            sessionStorage.getItem("github-repository");

        if (!storedRepository) {
            setLoading(false);
            return;
        }

        try {
            const parsedRepository: GitHubRepositoryResponse =
                JSON.parse(storedRepository);

            setRepository(parsedRepository);
        } catch (error) {
            console.error(
                "Erro ao ler dados do repositório:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />

                    Carregando informações do repositório...
                </div>
            </main>
        );
    }

    if (!repository) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
                <h1 className="text-xl font-semibold">
                    Repositório não encontrado
                </h1>

                <p className="max-w-md text-sm text-muted-foreground">
                    Não foi possível carregar as informações do
                    repositório. Volte para a página inicial e
                    tente realizar uma nova análise.
                </p>
            </main>
        );
    }

    const repositoryStats = [
        {
            label: "Stars",
            value: repository.stargazers_count.toLocaleString(
                "pt-BR"
            ),
            description: "Estrelas no GitHub",
        },
        {
            label: "Forks",
            value: repository.forks_count.toLocaleString(
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
    ];

    const technologies = repository.language
        ? [repository.language]
        : [];

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-[-350px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <DashboardHeader />

            <div className="mx-auto max-w-7xl px-6 py-10">
                <RepositoryHeader
                    repositoryUrl={repositoryUrl}
                    owner={repository.owner.login}
                    repositoryName={repository.name}
                    description={repository.description}
                    isPrivate={repository.private}
                />

                <RepositoryStats
                    stats={repositoryStats}
                />

                <section className="mt-8 grid gap-6 lg:grid-cols-3">
                    <ArchitectureAnalysis />

                    <Technologies
                        technologies={technologies}
                    />
                </section>

                <ProjectStructure />

                <RepositoryChat />

                <ButtonTop />
            </div>
        </main>
    );
}