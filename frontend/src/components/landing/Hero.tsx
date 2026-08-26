"use client";

import { useHero } from "@/hooks/useHero";
import { RepositoryTooLargeDialog } from "@/components/landing/RepositoryTooLargeDialog";
import { ButtonClearInput } from "@/components/landing/ButtonClearInput";

export function Hero() {
    const {
        repositoryUrl,
        setRepositoryUrl,
        loading,
        error,
        repositoryTooLarge,
        setRepositoryTooLarge,
        repositorySize,
        handleAnalyze,
        formatRepositorySize,
    } = useHero();

    return (
        <>
            <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-24 text-center sm:pt-32">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Análise inteligente de código com IA
                </div>
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                    Entenda qualquer repositório do{" "}
                    <span className="text-muted-foreground">
                        GitHub
                    </span>{" "}
                    com IA.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Insira o link de um repositório e deixe a inteligência
                    artificial analisar sua arquitetura, tecnologias, estrutura,
                    código e possíveis melhorias.
                </p>
                <form
                    onSubmit={handleAnalyze}
                    className="mt-10 w-full max-w-2xl"
                >
                    <div className="rounded-xl border border-lime-500 bg-card p-2 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v8m-4-4h8M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"
                                    />
                                </svg>
                                <input
                                    type="url"
                                    value={repositoryUrl}
                                    onChange={(event) =>
                                        setRepositoryUrl(event.target.value)
                                    }
                                    placeholder="https://github.com/usuario/repositorio"
                                    disabled={loading}
                                    aria-invalid={!!error}
                                    aria-describedby={
                                        error
                                            ? "repository-error"
                                            : undefined
                                    }
                                    className="h-12 w-full rounded-lg border border-lime-500  pl-12 pr-12 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                                />
                                <ButtonClearInput
                                    repositoryUrl={repositoryUrl}
                                    setRepositoryUrl={setRepositoryUrl}
                                    loading={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 cursor-pointer rounded-lg bg-foreground px-6 text-sm 
                                font-semibold text-background transition border border-lime-500
                                hover:scale-105 hover:bg-lime-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                                        Analisando...
                                    </span>
                                ) : (
                                    "Analisar repositório"
                                )}
                            </button>
                        </div>
                    </div>
                    {error ? (
                        <p
                            id="repository-error"
                            className="mt-3 text-left text-sm text-red-500"
                        >
                            {error}
                        </p>
                    ) : (
                        <p className="mt-3 text-left text-xs text-muted-foreground">
                            Exemplo: https://github.com/facebook/react
                        </p>
                    )}
                </form>
                <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
                    <span>GitHub</span>
                    <span className="text-border">•</span>
                    <span>LLMs</span>
                    <span className="text-border">•</span>
                    <span>RAG</span>
                    <span className="text-border">•</span>
                    <span>LangChain</span>
                    <span className="text-border">•</span>
                    <span>Embeddings</span>
                </div>
            </section>
            {repositoryTooLarge && (
                <RepositoryTooLargeDialog
                    repositorySize={repositorySize}
                    onClose={() => setRepositoryTooLarge(false)}
                    formatRepositorySize={formatRepositorySize}
                />
            )}
        </>
    );
}