"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/i18n";
const languages = [
    {
        locale: "pt",
        country: "br",
        label: "Português",
    },
    {
        locale: "en",
        country: "us",
        label: "English",
    },
    {
        locale: "es",
        country: "es",
        label: "Español",
    },
] as const;

type Language = (typeof languages)[number]["locale"];

export function IdiomSelector() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentLocale, setCurrentLocale] = useState<Language>("pt");

    useEffect(() => {
        const language = i18n.language?.split("-")[0] as Language;

        if (languages.some((item) => item.locale === language)) {
            setCurrentLocale(language);
        }
    }, []);

    function changeLanguage(nextLocale: Language) {
        setIsOpen(false);

        if (nextLocale === currentLocale) {
            return;
        }

        i18n.changeLanguage(nextLocale);
        setCurrentLocale(nextLocale);
    }

    const currentLanguage = languages.find((language) => language.locale === currentLocale) ??
        languages[0];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={t("common.language")}
                aria-expanded={isOpen}
                className="flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-background p-0 shadow-sm transition-all hover:scale-105 dark:border-zinc-700"
            >
                <span
                    className={`fi fi-${currentLanguage.country}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <div className="absolute right-full top-1/2 mr-2 flex -translate-y-1/2 items-center gap-1 rounded-full border border-zinc-200 bg-background/95 p-1 shadow-lg backdrop-blur-md dark:border-zinc-700">
                    {languages.map((language) => {
                        const isSelected =
                            language.locale === currentLocale;

                        return (
                            <button
                                key={language.locale}
                                type="button"
                                onClick={() =>
                                    changeLanguage(language.locale)
                                }
                                aria-label={language.label}
                                aria-current={
                                    isSelected ? "true" : undefined
                                }
                                className={`flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border p-0 transition-all hover:scale-105 ${
                                    isSelected
                                        ? "border-zinc-900 dark:border-zinc-100"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                            >
                                <span
                                    className={`fi fi-${language.country}`}
                                    aria-hidden="true"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}