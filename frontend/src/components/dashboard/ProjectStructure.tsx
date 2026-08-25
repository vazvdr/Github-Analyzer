import type { GitHubTreeItem } from "@/lib/github/github.types";

interface ProjectStructureProps {
    files: GitHubTreeItem[];
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
            const childPrefix = prefix + (isLast ? "    " : "│   ");

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
}: ProjectStructureProps) {
    const tree = buildTree(files);

    const structure = renderTree(tree);

    return (
        <section className="mt-6 rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-5">
                <h2 className="font-semibold">
                    Estrutura do projeto
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Estrutura de diretórios identificada durante a análise.
                </p>
            </div>

            <div className="overflow-x-auto p-6">
                <pre className="rounded-lg border border-border bg-muted/50 p-5 text-sm leading-7 text-muted-foreground">
                    <code>{structure}</code>
                </pre>
            </div>
        </section>
    );
}