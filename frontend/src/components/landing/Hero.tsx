"use client";

import { useEffect, useState } from "react";

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

    const [showHero, setShowHero] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHero(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* Tela inicial com GitHub gigante */}
            <div
                className={`github-intro ${
                    showHero ? "github-intro-hidden" : ""
                }`}
                aria-hidden={showHero}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="github-intro-icon"
                >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.341-3.369-1.341-.455-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.004.071 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.57 9.57 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.337-.012 2.415-.012 2.744 0 .269.18.58.688.482A10.001 10.001 0 0 0 22 12C22 6.477 17.523 2 12 2Z" />
                </svg>
            </div>

            {/* Hero */}
            <section
                className={`hero-section ${
                    showHero ? "hero-section-visible" : ""
                }`}
            >
                <div className="hero-content w-full">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Análise inteligente de código com IA
                    </div>

                    <h1 className="hero-title-gradient mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                        Entenda qualquer repositório do{" "}
                        <span className="github-gradient github-animated">
                            GitHub
                        </span>{" "}
                        com nossa IA.
                    </h1>

                    <p className="hero-paragraph mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg">
                        Insira o link de um repositório e deixe a inteligência
                        artificial analisar sua arquitetura, tecnologias,
                        estrutura, código e possíveis melhorias.
                    </p>

                    <form
                        onSubmit={handleAnalyze}
                        className="mx-auto mt-10 w-full max-w-2xl"
                    >
                        <div className="rounded-xl bg-card p-2 shadow-sm">
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
                                            setRepositoryUrl(
                                                event.target.value
                                            )
                                        }
                                        placeholder="https://github.com/usuario/repositorio"
                                        disabled={loading}
                                        aria-invalid={!!error}
                                        aria-describedby={
                                            error
                                                ? "repository-error"
                                                : undefined
                                        }
                                        className="hero-input h-12 w-full rounded-lg pl-12 pr-12 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="buttons h-12 cursor-pointer rounded-lg px-6 text-sm font-semibold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
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
                            <p className="mt-3 text-left text-xs">
                                Exemplo: https://github.com/facebook/react
                            </p>
                        )}
                    </form>

                    <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs">
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