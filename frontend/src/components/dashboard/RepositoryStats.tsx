interface RepositoryStat {
    label: string;
    value: string;
    description: string;
    icon: React.ReactNode;
}

interface RepositoryStatsProps {
    stats: RepositoryStat[];
}

export function RepositoryStats({
    stats,
}: RepositoryStatsProps) {
    return (
        <section className="mt-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {stat.label}
                            </span>

                            <div className="text-muted-foreground">
                                {stat.icon}
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="text-2xl font-bold tracking-tight">
                                {stat.value}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}