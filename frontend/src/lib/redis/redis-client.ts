import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL não configurada.");
}
const globalForRedis = globalThis as unknown as {
    redis: ReturnType<typeof createClient> | undefined;
};
export const redis =
    globalForRedis.redis ??
    createClient({
        url: redisUrl,
    });
redis.on("error", (error) => {
    console.error("Erro na conexão com Redis:", error);
});
if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}
export async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
    return redis;
}