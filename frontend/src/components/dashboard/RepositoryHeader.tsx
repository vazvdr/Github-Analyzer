import type { RepositoryHeaderProps } from "@/types/dashboard/repository-header.types";

export function RepositoryHeader({
    repositoryUrl,
    owner,
    repositoryName,
    description,
    isPrivate,
}: RepositoryHeaderProps) {
    return (
        <section>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm">
                        <span>Repositório analisado</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {repositoryName}
                        </h1>
                        <span className="dashboard-accent-background dashboard-accent-border dashboard-accent rounded-full border px-3 py-1 text-xs font-medium">
                            {isPrivate ? "Private" : "Public"}
                        </span>
                    </div>
                    {description && (
                        <p className="mt-3 max-w-2xl text-sm leading-6">
                            {description}
                        </p>
                    )}
                    <a
                        href={repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="dashboard-accent mt-4 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
                    >
                        github.com/{owner}/{repositoryName}

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 17 17 7M8 7h9v9"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}