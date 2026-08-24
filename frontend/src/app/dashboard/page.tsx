"use client";
import { useSearchParams } from "next/navigation";
import { ArchitectureAnalysis } from "@/components/dashboard/ArchitectureAnalysis";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectStructure } from "@/components/dashboard/ProjectStructure";
import { RepositoryChat } from "@/components/dashboard/RepositoryChat";
import { RepositoryHeader } from "@/components/dashboard/RepositoryHeader";
import { RepositoryStats } from "@/components/dashboard/RepositoryStats";
import { Technologies } from "@/components/dashboard/Technologies";

const technologies = [
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
];

const repositoryStats = [
    {
        label: "Stars",
        value: "12.8k",
        description: "Estrelas no GitHub",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"
                />
            </svg>
        ),
    },
    {
        label: "Forks",
        value: "2.4k",
        description: "Forks do repositório",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="18" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.5 6H13a5 5 0 0 1 5 5v4.5M8.5 6v1.5A5 5 0 0 0 13.5 12H15"
                />
            </svg>
        ),
    },
    {
        label: "Arquivos",
        value: "384",
        description: "Arquivos analisados",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 3v5h5M8 13h8M8 17h6"
                />
            </svg>
        ),
    },
    {
        label: "Linguagem",
        value: "TypeScript",
        description: "Principal linguagem",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 5h16M4 12h16M4 19h16"
                />
            </svg>
        ),
    },
];

export default function DashboardPage() {
    const searchParams = useSearchParams();

    const repositoryUrl =
        searchParams.get("repository") ??
        "https://github.com/user/github-analyzer";

    const repositoryPath = repositoryUrl
        .replace("https://github.com/", "")
        .replace(/\/$/, "");

    const [owner, repositoryName] = repositoryPath.split("/");

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-[-350px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <DashboardHeader />

            <div className="mx-auto max-w-7xl px-6 py-10">
                <RepositoryHeader
                    repositoryUrl={repositoryUrl}
                    owner={owner ?? "user"}
                    repositoryName={repositoryName ?? "github-analyzer"}
                />

                <RepositoryStats stats={repositoryStats} />

                <section className="mt-8 grid gap-6 lg:grid-cols-3">
                    <ArchitectureAnalysis />

                    <Technologies technologies={technologies} />
                </section>

                <ProjectStructure />

                <RepositoryChat />
            </div>
        </main>
    );
}