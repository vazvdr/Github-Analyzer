"use client";

import { useEffect, useState } from "react";

export function ButtonTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function handleScroll() {
            setVisible(window.scrollY > 400);
        }

        handleScroll();

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    function handleScrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    if (!visible) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleScrollToTop}
            aria-label="Voltar ao topo"
            title="Voltar ao topo"
            className="fixed bottom-26 right-6 z-50 flex h-10 w-10 
            items-center justify-center rounded-md border border-border 
            bg-background text-foreground shadow-lg 
            transition-colors hover:bg-muted cursor-pointer"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 15 7-7 7 7"
                />
            </svg>
        </button>
    );
}