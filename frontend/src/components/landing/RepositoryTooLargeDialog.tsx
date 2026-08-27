import type { RepositoryTooLargeDialogProps } from "@/types/landing/repository-too-large-dialog.types";

export function RepositoryTooLargeDialog({
    repositorySize,
    onClose,
    formatRepositorySize,
}: RepositoryTooLargeDialogProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="repository-too-large-title"
        >
            <div className="repository-dialog w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
                <div className="px-6 py-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-6 w-6"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v4m0 4h.01M10.29 3.86l-8.82 15a2 2 0 0 0 1.72 3h17.62a2 2 0 0 0 1.72-3l-8.82-15a2 2 0 0 0-3.42 0Z"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2
                                id="repository-too-large-title"
                                className="text-lg font-semibold"
                            >
                                Repositório muito grande
                            </h2>

                            <p className="mt-1 text-sm">
                                O repositório informado excede o limite permitido
                                para análise.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border p-4">
                            <p className="text-xs">
                                Tamanho enviado
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {formatRepositorySize(repositorySize)}
                            </p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-xs">
                                Limite permitido
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                40 MB
                            </p>
                        </div>
                    </div>

                    <p className="mt-5 text-sm leading-6">
                        Este repositório é muito grande para ser analisado. No
                        momento, o tamanho máximo permitido é de 40 MB.
                    </p>

                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-6 h-11 w-full cursor-pointer rounded-lg px-5 text-sm font-semibold transition"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}