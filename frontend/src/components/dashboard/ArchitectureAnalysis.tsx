const positivePoints = [
    "Stack moderna e bem suportada.",
    "Uso de TypeScript para segurança de tipos.",
    "Componentização adequada.",
    "Estrutura preparada para crescimento.",
];

export function ArchitectureAnalysis() {
    return (
        <div className="rounded-xl border border-border bg-card lg:col-span-2">
            <div className="border-b border-border px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">
                            Análise da arquitetura
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Visão geral gerada pela inteligência artificial.
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium">
                        IA
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                <div>
                    <h3 className="text-sm font-semibold">
                        Visão geral
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        O projeto utiliza uma arquitetura moderna baseada em
                        Next.js e TypeScript. A aplicação está organizada em
                        componentes reutilizáveis e utiliza o App Router para
                        estruturar as páginas.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold">
                        Organização
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        A estrutura apresenta uma separação clara entre
                        interface, regras de negócio e recursos compartilhados.
                        O projeto também utiliza Tailwind CSS para estilização.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold">
                        Pontos positivos
                    </h3>

                    <ul className="mt-3 space-y-2">
                        {positivePoints.map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-3 text-sm text-muted-foreground"
                            >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />

                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}