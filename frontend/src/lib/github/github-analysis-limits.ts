export const GITHUB_ANALYSIS_LIMITS = {
    //limites do zip
    maxZipSize: 40 * 1024 * 1024,
    //limites do processamento
    maxRelevantFiles: 300,
    maxFileSize: 500 * 1024,
    maxTotalContentSize: 5 * 1024 * 1024,
    //limites de segurança do zip
    maxZipEntries: 5000,
    maxUncompressedZipSize: 50 * 1024 * 1024,
    //timeout de download
    downloadTimeoutMs: 30_000,
    // rate limit de 5 analises por IP em 1 min
    rateLimit: {
        maxRequests: 5,
        windowMs: 60_000,
    },
    //numero maximo de analises simultaneas
    maxConcurrentAnalyses: 2,
};