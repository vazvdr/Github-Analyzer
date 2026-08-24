import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "GitHub Repository Analyzer",
  description: "Análise inteligente de repositórios GitHub com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}