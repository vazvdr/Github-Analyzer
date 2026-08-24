export function RepositoryChat() {
    return (
        <section className="mt-6 rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 10h8M8 14h5M5 20l-1 1 .5-4.5A8 8 0 1 1 20 12a8 8 0 0 1-15.5 4.5"
                            />
                        </svg>
                    </div>

                    <div>
                        <h2 className="font-semibold">
                            Converse com o repositório
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Faça perguntas sobre o código utilizando IA.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="rounded-lg border border-border bg-muted/30 p-5">
                    <p className="text-sm text-muted-foreground">
                        O chat com o repositório será disponibilizado aqui
                        depois que implementarmos o pipeline de RAG.
                    </p>
                </div>

                <div className="mt-4 flex gap-2">
                    <input
                        type="text"
                        disabled
                        placeholder="Pergunte qualquer coisa sobre o código..."
                        className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                        disabled
                        className="h-11 rounded-lg bg-foreground px-5 text-sm font-semibold text-background opacity-50"
                    >
                        Perguntar
                    </button>
                </div>
            </div>
        </section>
    );
}