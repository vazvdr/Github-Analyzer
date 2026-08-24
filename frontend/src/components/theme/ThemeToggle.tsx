"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    function toggleTheme() {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="flex h-10 w-10 items-center justify-center 
            rounded-lg border border-border bg-background text-foreground 
            transition-colors hover:bg-muted cursor-pointer"
        >
            <Sun className="hidden h-5 w-5 dark:block" />
            <Moon className="block h-5 w-5 dark:hidden" />
        </button>
    );
}