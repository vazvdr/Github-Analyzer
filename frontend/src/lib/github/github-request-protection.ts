import { NextRequest } from "next/server";
import { GITHUB_ANALYSIS_LIMITS } from "./github-analysis-limits";
interface RateLimitEntry {
    count: number;
    resetAt: number;
}
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
}
const rateLimitStore = new Map<
    string,
    RateLimitEntry
>();
let activeAnalyses = 0;
// Obtem o IP do client 
export function getClientIp(
    request: NextRequest
): string {
    const forwardedFor =
        request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const firstIp = forwardedFor
            .split(",")[0]
            ?.trim();

        if (firstIp) {
            return firstIp;
        }
    }
    const realIp =
        request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }
    return "unknown";
}
// contabiliza a requisicao por IP
export function checkRateLimit(
    ip: string
): RateLimitResult {
    const now = Date.now();
    const existing =
        rateLimitStore.get(ip);
    if (
        !existing ||
        now >= existing.resetAt
    ) {
        rateLimitStore.set(ip, {
            count: 1,
            resetAt:
                now +
                GITHUB_ANALYSIS_LIMITS.rateLimit
                    .windowMs,
        });
        return {
            allowed: true,
            remaining:
                GITHUB_ANALYSIS_LIMITS.rateLimit
                    .maxRequests - 1,
            retryAfterSeconds: 0,
        };
    }
    //limite atingido
    if (
        existing.count >=
        GITHUB_ANALYSIS_LIMITS.rateLimit.maxRequests
    ) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil(
                    (existing.resetAt - now) /
                    1000
                )
            ),
        };
    }
    existing.count += 1;
    return {
        allowed: true,
        remaining:
            GITHUB_ANALYSIS_LIMITS.rateLimit
                .maxRequests -
            existing.count,
        retryAfterSeconds: 0,
    };
}
//remove registros expirados automaticamente
function cleanupRateLimitStore(): void {
    const now = Date.now();
    for (const [
        ip,
        entry,
    ] of rateLimitStore.entries()) {
        if (now >= entry.resetAt) {
            rateLimitStore.delete(ip);
        }
    }
}
// Tenta pegar uma vaga para o processamento
export function acquireAnalysisSlot(): boolean {
    if (
        activeAnalyses >=
        GITHUB_ANALYSIS_LIMITS
            .maxConcurrentAnalyses
    ) {
        return false;
    }
    activeAnalyses += 1;
    return true;
}
//Libera uma vaga para o processamento
export function releaseAnalysisSlot(): void {
    if (activeAnalyses > 0) {
        activeAnalyses -= 1;
    }
}
// retorna a quantidade de analise atual para processamento
export function getActiveAnalyses(): number {
    return activeAnalyses;
}
// executa limpeza
let lastCleanup = 0;
export function cleanupRateLimitIfNeeded(): void {
    const now = Date.now();

    if (now - lastCleanup < 60_000) {
        return;
    }
    lastCleanup = now;
    cleanupRateLimitStore();
}