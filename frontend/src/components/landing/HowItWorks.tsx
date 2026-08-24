export function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Informe o repositório",
            description:
                "Cole a URL pública de qualquer repositório do GitHub que você deseja analisar.",
        },
        {
            number: "02",
            title: "A IA analisa o código",
            description:
                "O sistema processará os arquivos, estrutura, dependências e conteúdo relevante do projeto.",
        },
        {
            number: "03",
            title: "Explore os resultados",
            description:
                "Você poderá conversar com a IA sobre o repositório e obter respostas baseadas no próprio código.",
        },
    ];

    return (
        <section
            id="como-funciona"
            className="border-y border-border/60 bg-muted/20"
        >
            <div className="mx-auto max-w-6xl px-6 py-20">
                <div className="max-w-2xl">
                    <span className="text-sm font-semibold text-muted-foreground">
                        COMO FUNCIONA
                    </span>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight">
                        Da URL para uma análise completa.
                    </h2>

                    <p className="mt-4 text-muted-foreground">
                        O sistema será responsável por processar o repositório
                        e utilizar IA para transformar o código em informações
                        úteis.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 md:grid-cols-3">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="rounded-xl border border-border bg-card p-6"
                        >
                            <span className="text-sm font-semibold text-muted-foreground">
                                {step.number}
                            </span>

                            <h3 className="mt-5 text-lg font-semibold">
                                {step.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}