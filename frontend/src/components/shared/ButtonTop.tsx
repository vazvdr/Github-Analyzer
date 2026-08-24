"use client";

export function ButtonTop() {
    function handleScrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <button
            type="button"
            onClick={handleScrollToTop}
            aria-label="Voltar ao topo"
            title="Voltar ao topo"
            className="fixed bottom-6 right-6 z-50 flex h-10 w-10 
            items-center justify-center rounded-lg border border-border bg-background 
            text-foreground shadow-sm transition-all hover:-translate-y-1 hover:bg-muted
            cursor-pointer"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 15 6-6 6 6"
                />
            </svg>
        </button>
    );
}