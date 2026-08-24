"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                type="button"
                aria-label="Alternar tema"
                disabled
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground opacity-50"
            >
                <Sun className="h-5 w-5" />
            </button>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Alternar tema"
            className="flex h-10 w-10 items-center justify-center 
            rounded-lg border border-border bg-background 
            text-foreground transition-colors 
            hover:bg-muted cursor-pointer"
        >
            {isDark ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
}