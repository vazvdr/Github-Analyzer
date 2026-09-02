"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
    useRepositoryChat,
} from "@/hooks/useRepositoryChat";

interface RepositoryChatProps {
    repositoryUrl: string;
}

export function RepositoryChat({
    repositoryUrl,
}: RepositoryChatProps) {
    const { t } = useTranslation();

    const {
        messages,
        input,
        loading,
        error,
        setInput,
        sendMessage,
    } = useRepositoryChat({
        repositoryUrl,
    });

    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        void sendMessage();
    }

    function handleKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            void sendMessage();
        }
    }

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
                            {t("repositoryChat.title")}
                        </h2>

                        <p className="mt-1 text-sm">
                            {t(
                                "repositoryChat.description"
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="dashboard-muted-surface dashboard-border min-h-[220px] max-h-[520px] space-y-4 overflow-y-auto rounded-lg border p-4">
                    {messages.length === 0 && (
                        <div className="flex min-h-[180px] items-center justify-center text-center">
                            <div className="max-w-md">
                                <p className="text-sm font-medium">
                                    {t(
                                        "repositoryChat.emptyTitle"
                                    )}
                                </p>

                                <p className="mt-2 text-sm">
                                    {t(
                                        "repositoryChat.emptyDescription"
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => {
                        const isUser =
                            message.role === "user";

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isUser
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6 ${isUser
                                            ? "dashboard-accent-background dashboard-accent-border dashboard-accent border"
                                            : "dashboard-surface dashboard-border border"
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="dashboard-surface dashboard-border flex items-center gap-3 rounded-xl border px-4 py-3">
                                <span className="dashboard-accent h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />

                                <span className="text-sm">
                                    {t(
                                        "repositoryChat.thinking"
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <div className="dashboard-accent-background dashboard-accent-border dashboard-accent mt-4 rounded-lg border p-4">
                        <p className="text-sm">
                            {error}
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(event) =>
                            setInput(
                                event.target.value
                            )
                        }
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        placeholder={t(
                            "repositoryChat.inputPlaceholder"
                        )}
                        className="dashboard-input h-11 flex-1 rounded-lg border px-4 text-sm outline-none transition focus:ring-2 focus:ring-current/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !input.trim()
                        }
                        className="dashboard-button h-11 cursor-pointer rounded-lg px-5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading
                            ? t(
                                "repositoryChat.sending"
                            )
                            : t(
                                "repositoryChat.ask"
                            )}
                    </button>
                </form>
            </div>
        </section>
    );
}