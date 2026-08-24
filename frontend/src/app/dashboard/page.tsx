import { Suspense } from "react";

import DashboardContent from "./DashboardContent";

function DashboardLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />

                Carregando informações do repositório...
            </div>
        </main>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}