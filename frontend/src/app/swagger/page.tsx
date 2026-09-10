"use client";

import dynamic from "next/dynamic";

import "swagger-ui-react/swagger-ui.css";
import { swaggerSpec } from "@/lib/swagger/swagger";
const SwaggerUI = dynamic(
    () => import("swagger-ui-react"),
    {
        ssr: false,
    }
);

export default function SwaggerPage() {
    return (
        <main className="min-h-screen min-w-screen bg-white p-4">
            <SwaggerUI spec={swaggerSpec} />
        </main>
    );
}