"use client";
import { ArchitectureAnalysis } from "@/components/dashboard/ArchitectureAnalysis";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectStructure } from "@/components/dashboard/ProjectStructure";
import { RepositoryChat } from "@/components/dashboard/RepositoryChat";
import { RepositoryHeader } from "@/components/dashboard/RepositoryHeader";
import { RepositoryStats } from "@/components/dashboard/RepositoryStats";
import { Technologies } from "@/components/dashboard/Technologies";
import { ButtonTop } from "@/components/shared/ButtonTop";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardContent() {
    const {
        repository,
        files,
        structure,
        analysis,
        loading,
        repositoryUrl,
        repositoryStats,
        technologies,
        owner,
    } = useDashboard();

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
        return null;
    }
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-[-350px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            </div>
            <DashboardHeader />
            <div className="mx-auto max-w-7xl px-6 py-10">
                <RepositoryHeader
                    repositoryUrl={repositoryUrl}
                    owner={owner}
                    repositoryName={repository.name}
                    description={repository.description}
                    isPrivate={repository.private}
                />
                <RepositoryStats stats={repositoryStats} />
                <section className="mt-8 grid gap-6 lg:grid-cols-3">
                    <ArchitectureAnalysis />
                    <Technologies
                        technologies={technologies}
                    />
                </section>
                <ProjectStructure
                    files={files}
                    structure={structure}
                    analysis={analysis}
                />
                <RepositoryChat />
                <ButtonTop />
            </div>
        </main>
    );
}
