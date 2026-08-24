interface TechnologiesProps {
    technologies: string[];
}

export function Technologies({
    technologies,
}: TechnologiesProps) {
    return (
        <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-5">
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
                        className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium"
                    >
                        {technology}
                    </span>
                ))}
            </div>
        </div>
    );
}