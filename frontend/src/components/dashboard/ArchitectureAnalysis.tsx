"use client";

import { useTranslation } from "react-i18next";

import type { AIRepositoryAnalysis } from "@/lib/github/github.types";

interface ArchitectureAnalysisProps {
    analysis: AIRepositoryAnalysis | null;
    loading: boolean;
}

export function ArchitectureAnalysis({
    analysis,
    loading,
}: ArchitectureAnalysisProps) {
    const { t } = useTranslation();

    return (
        <div className="dashboard-surface dashboard-border rounded-xl border lg:col-span-2">
            <div className="dashboard-border border-b px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">
                            {t("architectureAnalysis.title")}
                        </h2>

                        <p className="mt-1 text-sm">
                            {t("architectureAnalysis.description")}
                        </p>
                    </div>

                    <div className="dashboard-accent-background dashboard-accent-border dashboard-accent rounded-lg border px-3 py-1.5 text-xs font-medium">
                        {t("architectureAnalysis.ai")}
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                {loading && (
                    <div className="flex items-center gap-3 text-sm">
                        <span className="h-4 w-4 animate-spin rounded-full" />
                        {t("architectureAnalysis.loading")}
                    </div>
                )}

                {!loading && !analysis && (
                    <div className="dashboard-muted-surface dashboard-border rounded-lg border p-5">
                        <p className="text-sm">
                            {t("architectureAnalysis.unavailable")}
                        </p>
                    </div>
                )}

                {!loading && analysis && (
                    <>
                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                {t("architectureAnalysis.overview")}
                            </h3>

                            <p className="mt-2 text-sm leading-7">
                                {analysis.overview}
                            </p>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                {t("architectureAnalysis.architecture")}
                            </h3>

                            <p className="mt-2 text-sm leading-7">
                                {analysis.architecture}
                            </p>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                {t("architectureAnalysis.strengths")}
                            </h3>

                            <ul className="mt-3 space-y-2">
                                {analysis.strengths.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <span className="dashboard-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                {t("architectureAnalysis.weaknesses")}
                            </h3>

                            <ul className="mt-3 space-y-2">
                                {analysis.weaknesses.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <span className="dashboard-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="dashboard-accent text-sm font-semibold">
                                {t("architectureAnalysis.recommendations")}
                            </h3>

                            <ul className="mt-3 space-y-2">
                                {analysis.recommendations.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3 text-sm"
                                    >
                                        <span className="dashboard-accent mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}