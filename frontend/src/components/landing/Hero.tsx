"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { parseGitHubRepository } from "@/lib/github/github-url";

export function Hero() {
    const router = useRouter();
    const [repositoryUrl, setRepositoryUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [repositoryTooLarge, setRepositoryTooLarge] = useState(false);
    const [repositorySize, setRepositorySize] = useState(0);

    async function handleAnalyze(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setError("");

        const url = repositoryUrl.trim();

        if (!url) {
            setError(
                "Informe a URL de um repositório do GitHub."
            );
            return;
        }

        const repository = parseGitHubRepository(url);

        if (!repository) {
            setError(
                "Informe uma URL válida no formato https://github.com/usuario/repositorio."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/github/repository",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        url,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (
                    response.status === 413 &&
                    data.code === "REPOSITORY_TOO_LARGE"
                ) {
                    setRepositorySize(
                        data.repository?.size ?? 0
                    );
                    setRepositoryTooLarge(true);
                    return;
                }

                setError(
                    data.error ??
                    data.message ??
                    "Não foi possível analisar o repositório."
                );
                return;
            }

            sessionStorage.setItem(
                "github-repository",
                JSON.stringify(data.repository)
            );

            router.push(
                `/dashboard?repository=${encodeURIComponent(url)}`
            );
        } catch {
            setError(
                "Não foi possível conectar ao GitHub. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    }

    function formatRepositorySize(sizeInKb: number) {
        const sizeInMb = sizeInKb / 1024;

        if (sizeInMb < 1) {
            return `${sizeInKb.toFixed(0)} KB`;
        }

        return `${sizeInMb.toFixed(2)} MB`;
    }

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
                    <div className="rounded-xl border border-border bg-card p-2 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
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
                                    onChange={(event) => {
                                        setRepositoryUrl(event.target.value);
                                        setError("");
                                    }}
                                    placeholder="https://github.com/usuario/repositorio"
                                    disabled={loading}
                                    aria-invalid={!!error}
                                    aria-describedby={
                                        error
                                            ? "repository-error"
                                            : undefined
                                    }
                                    className="h-12 w-full rounded-lg border border-border bg-background pl-12 pr-4 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 rounded-lg bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="repository-too-large-title"
                >
                    <div className="repository-dialog w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
                        <div className="px-6 py-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v4m0 4h.01M10.29 3.86l-8.82 15a2 2 0 0 0 1.72 3h17.62a2 2 0 0 0 1.72-3l-8.82-15a2 2 0 0 0-3.42 0Z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <h2
                                        id="repository-too-large-title"
                                        className="text-lg font-semibold"
                                    >
                                        Repositório muito grande
                                    </h2>

                                    <p className="mt-1 text-sm">
                                        O repositório informado excede o limite permitido
                                        para análise.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border p-4">
                                    <p className="text-xs">
                                        Tamanho enviado
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-white">
                                        {formatRepositorySize(repositorySize)}
                                    </p>
                                </div>

                                <div className="rounded-xl border p-4">
                                    <p className="text-xs">
                                        Limite permitido
                                    </p>

                                    <p className="mt-1 text-lg font-semibold text-white">
                                        10 MB
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 text-sm leading-6">
                                Este repositório é muito grande para ser analisado. No
                                momento, o tamanho máximo permitido é de 10 MB.
                            </p>

                            <button
                                type="button"
                                onClick={() => setRepositoryTooLarge(false)}
                                className="mt-6 h-11 w-full rounded-lg px-5 text-sm font-semibold transition cursor-pointer"
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}