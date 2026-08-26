export interface RepositoryStat {
    label: string;
    value: string;
    description: string;
}

export interface RepositoryStatsProps {
    stats: RepositoryStat[];
}