import type { Metadata } from "next";

import "./globals.css";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/components/idiom/i18nProvider";

export const metadata: Metadata = {
    title: "GitHub Analyzer",
    description: "Análise inteligente de repositórios GitHub",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body>
                <I18nProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </I18nProvider>
            </body>
        </html>
    );
}