"use client";

import { HoverEffect } from "@/components/ui/card-hover-effect";

const steps = [
    {
        title: "01 — Informe o repositório",
        description:
            "Cole a URL pública de qualquer repositório do GitHub que você deseja analisar.",
    },
    {
        title: "02 — A IA analisa o código",
        description:
            "O sistema processará os arquivos, estrutura, dependências e conteúdo relevante do projeto.",
    },
    {
        title: "03 — Explore os resultados",
        description:
            "Você poderá conversar com a IA sobre o repositório e obter respostas baseadas no próprio código.",
    },
];

export function HowItWorks() {
    return (
        <section id="como-funciona">
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

                <HoverEffect
                    items={steps}
                    className="mt-6 grid-cols-1 md:grid-cols-3"
                />
            </div>
        </section>
    );
}