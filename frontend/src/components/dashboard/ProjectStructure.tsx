export function ProjectStructure() {
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
                    <code>{`github-analyzer/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── services/
│
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md`}</code>
                </pre>
            </div>
        </section>
    );
}