export function RepositoryChat() {
    return (
        <section className="dashboard-surface dashboard-border mt-6 rounded-xl border">
            <div className="dashboard-border border-b px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="dashboard-accent-background dashboard-accent flex h-9 w-9 items-center justify-center rounded-lg">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                            aria-hidden="true"
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

                        <p className="mt-1 text-sm">
                            Faça perguntas sobre o código utilizando IA.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="dashboard-muted-surface dashboard-border rounded-lg border p-5">
                    <p className="text-sm">
                        O chat com o repositório será disponibilizado aqui
                        depois que implementarmos o pipeline de RAG.
                    </p>
                </div>

                <div className="mt-4 flex gap-2">
                    <input
                        type="text"
                        disabled
                        placeholder="Pergunte qualquer coisa sobre o código..."
                        className="dashboard-input h-11 flex-1 rounded-lg border px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                        type="button"
                        disabled
                        className="dashboard-button h-11 rounded-lg px-5 text-sm font-semibold opacity-50"
                    >
                        Perguntar
                    </button>
                </div>
            </div>
        </section>
    );
}