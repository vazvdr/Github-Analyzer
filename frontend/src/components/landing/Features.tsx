import { HoverEffect } from "@/components/ui/card-hover-effect";

const features = [
    {
        title: "Arquitetura",
        description:
            "Identifique a estrutura e organização do projeto.",
    },
    {
        title: "Tecnologias",
        description:
            "Descubra a linguagem de programação utilizada.",
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
            className="mx-auto max-w-6xl px-6 py-20 border-y border-[var(--section-border)]"
        >
            <div className="text-center ">
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

            <HoverEffect
                items={features}
                className="mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            />
        </section>
    );
}