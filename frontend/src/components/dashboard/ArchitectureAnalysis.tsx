import type { AIRepositoryAnalysis } from "@/lib/github/github.types";

interface ArchitectureAnalysisProps {
    analysis: AIRepositoryAnalysis | null;
    loading: boolean;
}

export function ArchitectureAnalysis({
    analysis,
    loading,
}: ArchitectureAnalysisProps) {
    return (
        <div className="dashboard-surface dashboard-border rounded-xl border lg:col-span-2">
            <div className="dashboard-border border-b px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">
                            Análise da arquitetura
                        </h2>

                        <p className="mt-1 text-sm">
                            Visão geral gerada pela inteligência artificial.
                        </p>
                    </div>

                    <div className="dashboard-accent-background dashboard-accent-border dashboard-accent rounded-lg border px-3 py-1.5 text-xs font-medium">
                        IA
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                {loading && (
                    <div className="flex items-center gap-3 text-sm">
                        <span className="h-4 w-4 animate-spin rounded-full" />
                        Analisando o código com IA...
                    </div>
                )}

                {!loading && !analysis && (
                    <div className="dashboard-muted-surface dashboard-border rounded-lg border p-5">
                        <p className="text-sm">
                            A análise da arquitetura ainda não está disponível.
                        </p>
                    </div>
                )}

                {!loading && analysis && (
                    <>
                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                Visão geral
                            </h3>

                            <p className="mt-2 text-sm leading-7">
                                {analysis.overview}
                            </p>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                Arquitetura
                            </h3>

                            <p className="mt-2 text-sm leading-7">
                                {analysis.architecture}
                            </p>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                Pontos positivos
                            </h3>

                            <ul className="mt-3 space-y-2">
                                {analysis.strengths.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <span className="dashboard-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                Pontos de atenção
                            </h3>

                            <ul className="mt-3 space-y-2">
                                {analysis.weaknesses.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <span className="dashboard-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                Recomendações
                            </h3>

                            <ul className="mt-3 space-y-2">
                                {analysis.recommendations.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <span className="dashboard-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}