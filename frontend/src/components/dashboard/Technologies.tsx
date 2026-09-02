"use client";

import { useTranslation } from "react-i18next";

import type { TechnologiesProps } from "@/types/dashboard/technologies.types";

export function Technologies({
    technologies,
}: TechnologiesProps) {
    const { t } = useTranslation();

    return (
        <div className="dashboard-surface dashboard-border rounded-xl border">
            <div className="dashboard-border border-b px-6 py-5">
                <h2 className="font-semibold">
                    {t("technologies.title")}
                </h2>

                <p className="mt-1 text-sm">
                    {t("technologies.description")}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 p-6">
                {technologies.map((technology) => (
                    <span
                        key={technology}
                        className="dashboard-accent-background dashboard-accent-border dashboard-accent rounded-lg border px-3 py-2 text-sm font-medium"
                    >
                        {technology}
                    </span>
                ))}
            </div>
        </div>
    );
}