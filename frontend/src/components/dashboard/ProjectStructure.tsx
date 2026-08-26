import type {
    GitHubAnalysisInfo,
    GitHubAnalysisStructure,
    GitHubTreeItem,
} from "@/lib/github/github.types";

interface ProjectStructureProps {
    files: GitHubTreeItem[];
    structure?: GitHubAnalysisStructure;
    analysis?: GitHubAnalysisInfo;
}

function buildTree(files: GitHubTreeItem[]) {
    const root: Record<string, any> = {};

    for (const file of files) {
        const parts = file.path.split("/");
        let current = root;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;

            if (isFile) {
                current[part] = null;
            } else {
                if (!current[part]) {
                    current[part] = {};
                }

                current = current[part];
            }
        });
    }

    return root;
}

function renderTree(
    node: Record<string, any>,
    prefix = ""
): string {
    const entries = Object.entries(node);

    return entries
        .map(([name, value], index) => {
            const isLast = index === entries.length - 1;
            const connector = isLast ? "└── " : "├── ";
            const childPrefix =
                prefix + (isLast ? "    " : "│   ");

            if (value === null) {
                return `${prefix}${connector}${name}`;
            }

            return `${prefix}${connector}${name}/\n${renderTree(
                value,
                childPrefix
            )}`;
        })
        .join("\n");
}

export function ProjectStructure({
    files,
    structure,
    analysis,
}: ProjectStructureProps) {
    const tree = buildTree(files);
    const projectStructure = renderTree(tree);

    return (
        <section className="mt-6 rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-5">
                <h2 className="font-semibold">
                    Estrutura do projeto
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Estrutura de arquivos selecionados durante a análise.
                </p>
            </div>

            {structure && (
                <div className="grid gap-4 border-b border-border px-6 py-5 sm:grid-cols-4">
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
                <div className="border-b border-border px-6 py-5">
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                        <p className="text-sm font-medium">
                            Análise parcialmente limitada
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {analysis.reason}
                        </p>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto p-6">
                <pre className="rounded-lg border border-border bg-muted/50 p-5 text-sm leading-7 text-muted-foreground">
                    <code>{projectStructure}</code>
                </pre>
            </div>
        </section>
    );
}