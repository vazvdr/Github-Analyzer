import type { RepositoryStatsProps } from "@/types/dashboard/repository-stats.types";

function StarIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2 6.22-.9L12 3Z"
            />
        </svg>
    );
}

function ForkIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
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
    );
}

function LanguageIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5h16M4 12h16M4 19h16"
            />
        </svg>
    );
}

function BranchIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.5 6h2a5 5 0 0 1 5 5v4.5"
            />
        </svg>
    );
}

export function RepositoryStats({
    stats,
}: RepositoryStatsProps) {
    const icons = [
        <StarIcon key="stars" />,
        <ForkIcon key="forks" />,
        <LanguageIcon key="language" />,
        <BranchIcon key="branch" />,
    ];

    return (
        <section className="mt-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="dashboard-surface dashboard-border card-hover-effect rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm">
                                {stat.label}
                            </span>

                            <div className="transition-colors duration-200 group-hover:dashboard-accent">
                                {icons[index]}
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="text-2xl font-bold tracking-tight">
                                {stat.value}
                            </p>

                            <p className="mt-1 text-xs">
                                {stat.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}