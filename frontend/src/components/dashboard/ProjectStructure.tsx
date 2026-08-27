import type { ProjectStructureProps } from "@/types/dashboard/project-structure.types";
import { ProjectStructureUtils } from "@/utils/project-structure.utils";

export function ProjectStructure({
    files,
    structure,
    analysis,
}: ProjectStructureProps) {
    const projectStructure =
        ProjectStructureUtils.buildProjectStructure(files);

    return (
        <section className="dashboard-surface dashboard-border mt-6 rounded-xl border">
            <div className="dashboard-border border-b px-6 py-5">
                <h2 className="font-semibold">
                    Estrutura do projeto
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Estrutura de arquivos selecionados durante a análise.
                </p>
            </div>

            {structure && (
                <div className="dashboard-border grid gap-4 border-b px-6 py-5 sm:grid-cols-4">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Arquivos
                        </p>

                        <p className="mt-1 font-semibold">
                            {structure.totalFiles}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Relevantes
                        </p>

                        <p className="mt-1 font-semibold">
                            {structure.relevantFiles}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Analisados
                        </p>

                        <p className="mt-1 font-semibold">
                            {structure.analyzedFiles}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Ignorados
                        </p>

                        <p className="mt-1 font-semibold">
                            {structure.skippedFiles}
                        </p>
                    </div>
                </div>
            )}

            {analysis?.limited && analysis.reason && (
                <div className="dashboard-border border-b px-6 py-5">
                    <div className="dashboard-accent-background dashboard-accent-border rounded-lg border p-4">
                        <p className="dashboard-accent text-sm font-medium">
                            Análise parcialmente limitada
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {analysis.reason}
                        </p>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto p-6">
                <pre className="dashboard-code rounded-lg p-5 text-sm leading-7">
                    <code>{projectStructure}</code>
                </pre>
            </div>
        </section>
    );
}