import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseGitHubRepository } from "@/lib/github/github-url";

export function useHero() {
    const router = useRouter();
    const [repositoryUrl, setRepositoryUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [repositoryTooLarge, setRepositoryTooLarge] = useState(false);
    const [repositorySize, setRepositorySize] = useState(0);

    async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        const url = repositoryUrl.trim();
        if (!url) {
            setError("Informe a URL de um repositório do GitHub.");
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
            const response = await fetch("/api/github/repository", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();
            if (!response.ok) {
                if (
                    response.status === 413 &&
                    data.code === "REPOSITORY_TOO_LARGE"
                ) {
                    setRepositorySize(data.repository?.size ?? 0);
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
            // Salva o resultado completo da análise para o dashboard.
            sessionStorage.setItem(
                "github-analysis",
                JSON.stringify(data)
            );

            // Mantém a URL limpa e navega para o dashboard.
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
    return {
        repositoryUrl,
        setRepositoryUrl,
        loading,
        error,
        repositoryTooLarge,
        setRepositoryTooLarge,
        repositorySize,
        handleAnalyze,
        formatRepositorySize,
    };
}