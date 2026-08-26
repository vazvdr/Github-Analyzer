"use client";
import Link from "next/link";
import { ThemeToggle } from "../theme/ThemeToggle";
import { scrollToSection } from "@/utils/scroll-to-section";

export function Header() {
    return (
        <header className="border-b border-border/60">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.341-3.369-1.341-.455-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.004.071 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.57 9.57 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.337-.012 2.415-.012 2.744 0 .269.18.58.688.482A10.001 10.001 0 0 0 22 12C22 6.477 17.523 2 12 2Z" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        GitHub Analyzer
                    </span>
                </Link>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                    <a href="#como-funciona" onClick={(event) => scrollToSection(event, "como-funciona")}
                        className="transition-colors hover:text-foreground">
                        Como funciona
                    </a>
                    <a href="#recursos" onClick={(event) => scrollToSection(event, "recursos")}
                        className="transition-colors hover:text-foreground">
                        Recursos
                    </a>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}