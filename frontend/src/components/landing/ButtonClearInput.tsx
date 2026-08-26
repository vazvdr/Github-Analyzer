"use client";

type ButtonClearInputProps = {
    repositoryUrl: string;
    setRepositoryUrl: (value: string) => void;
    loading: boolean;
};

export function ButtonClearInput({
    repositoryUrl,
    setRepositoryUrl,
    loading,
}: ButtonClearInputProps) {
    if (!repositoryUrl || loading) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={() => setRepositoryUrl("")}
            aria-label="Limpar repositório"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                />
            </svg>
        </button>
    );
}