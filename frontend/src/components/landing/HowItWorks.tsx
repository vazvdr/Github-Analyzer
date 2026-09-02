"use client";
import { useTranslation } from "react-i18next";
import { HoverEffect } from "@/components/ui/card-hover-effect";

export function HowItWorks() {
    const { t } = useTranslation();
    const steps = [
        {
            title: t("howItWorks.steps.repository.title"),
            description: t("howItWorks.steps.repository.description"),
        },
        {
            title: t("howItWorks.steps.analysis.title"),
            description: t("howItWorks.steps.analysis.description"),
        },
        {
            title: t("howItWorks.steps.results.title"),
            description: t("howItWorks.steps.results.description"),
        },
    ];
    return (
        <section id="como-funciona">
            <div className="mx-auto max-w-6xl px-6 py-20">
                <div className="max-w-2xl">
                    <span className="text-sm font-semibold">
                        {t("howItWorks.label")}
                    </span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight">
                        {t("howItWorks.title")}
                    </h2>
                    <p className="mt-4">
                        {t("howItWorks.description")}
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