import type { TechnologiesProps } from "@/types/dashboard/technologies.types";

export function Technologies({
    technologies,
}: TechnologiesProps) {
    return (
        <div className="dashboard-surface dashboard-border rounded-xl border">
            <div className="dashboard-border border-b px-6 py-5">
                <h2 className="font-semibold">
                    Tecnologias
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Tecnologias identificadas no projeto.
                </p>
            </div>

            <div className="flex flex-wrap gap-2 p-6">
                {technologies.map((technology) => (
                    <span
                        key={technology}
                        className="dashboard-accent-background dashboard-accent-border dashboard-accent rounded-lg border px-3 py-2 text-sm font-medium"
                    >
                        {technology}
                    </span>
                ))}
            </div>
        </div>
    );
}