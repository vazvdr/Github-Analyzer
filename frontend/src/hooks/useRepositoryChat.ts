"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";

export type RepositoryChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
};

type ChatLanguage = "pt" | "en" | "es";

interface UseRepositoryChatProps {
    repositoryUrl: string;
}

interface ChatResponse {
    message: RepositoryChatMessage;
    messages: RepositoryChatMessage[];
    sha: string;
    error?: string;
}

export function useRepositoryChat({
    repositoryUrl,
}: UseRepositoryChatProps) {
    const { i18n: translationI18n } =
        useTranslation();

    const [messages, setMessages] = useState<
        RepositoryChatMessage[]
    >([]);

    const [input, setInput] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [language, setLanguage] =
        useState<ChatLanguage>("pt");

    useEffect(() => {
        const currentLanguage =
            translationI18n.language?.split("-")[0];

        if (
            currentLanguage === "pt" ||
            currentLanguage === "en" ||
            currentLanguage === "es"
        ) {
            setLanguage(currentLanguage);
        }
    }, [translationI18n.language]);

    useEffect(() => {
        setMessages([]);
        setError(null);
        setInput("");
    }, [repositoryUrl]);

    async function sendMessage() {
        const question = input.trim();

        if (!question || loading) {
            return;
        }

        setLoading(true);
        setError(null);

        const temporaryUserMessage: RepositoryChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
            createdAt: new Date().toISOString(),
        };

        setMessages((currentMessages) => [
            ...currentMessages,
            temporaryUserMessage,
        ]);

        setInput("");

        try {
            const response =
                await fetch("/api/github/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        url: repositoryUrl,
                        message: question,
                        language,
                    }),
                });

            const data =
                (await response.json()) as ChatResponse;

            if (!response.ok) {
                throw new Error(
                    data.error ??
                        "Não foi possível obter uma resposta."
                );
            }

            setMessages(
                data.messages
            );
        } catch (error) {
            console.error(
                "Erro ao enviar mensagem:",
                error
            );

            setMessages((currentMessages) =>
                currentMessages.filter(
                    (message) =>
                        message.id !==
                        temporaryUserMessage.id
                )
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível enviar a mensagem."
            );
        } finally {
            setLoading(false);
        }
    }

    function setInputValue(
        value: string
    ) {
        setInput(value);
        setError(null);
    }

    function clearChat() {
        setMessages([]);
        setError(null);
        setInput("");
    }

    return {
        messages,
        input,
        loading,
        error,
        language,
        setInput: setInputValue,
        sendMessage,
        clearChat,
    };
}