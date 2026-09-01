import { Suspense } from "react";
import DashboardContent from "./DashboardContent";
import { GitHubLoading } from "@/components/shared/GithubLoading";

function DashboardLoading() {
    return <GitHubLoading/>;
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}