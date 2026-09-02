"use client";
import { useTranslation } from "react-i18next";
import { HoverEffect } from "@/components/ui/card-hover-effect";
export function Features() {
    const { t } = useTranslation();
    const features = [
        {
            title: t("features.items.architecture.title"),
            description: t("features.items.architecture.description"),
        },
        {
            title: t("features.items.technologies.title"),
            description: t("features.items.technologies.description"),
        },
        {
            title: t("features.items.code.title"),
            description: t("features.items.code.description"),
        },
        {
            title: t("features.items.aiRag.title"),
            description: t("features.items.aiRag.description"),
        },
    ];
    return (
        <section
            id="recursos"
            className="mx-auto max-w-6xl border-y border-[var(--section-border)] px-6 py-20"
        >
            <div className="text-center">
                <span className="text-sm font-semibold">
                    {t("features.label")}
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                    {t("features.title")}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl">
                    {t("features.description")}
                </p>
            </div>

            <HoverEffect
                items={features}
                className="mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            />
        </section>
    );
}