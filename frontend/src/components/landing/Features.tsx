const features = [
    {
        title: "Arquitetura",
        description:
            "Identifique a estrutura e organização do projeto.",
    },
    {
        title: "Tecnologias",
        description:
            "Descubra frameworks, bibliotecas e ferramentas utilizadas.",
    },
    {
        title: "Código",
        description:
            "Faça perguntas sobre arquivos e trechos específicos.",
    },
    {
        title: "IA + RAG",
        description:
            "Obtenha respostas utilizando o próprio conteúdo do repositório.",
    },
];

export function Features() {
    return (
        <section
            id="recursos"
            className="mx-auto max-w-6xl px-6 py-20"
        >
            <div className="text-center">
                <span className="text-sm font-semibold text-muted-foreground">
                    RECURSOS
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                    Muito mais que um resumo do GitHub.
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                    O objetivo é transformar um repositório inteiro em uma
                    interface onde você consegue realmente conversar e
                    entender o projeto.
                </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="rounded-xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <h3 className="font-semibold">
                            {feature.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}