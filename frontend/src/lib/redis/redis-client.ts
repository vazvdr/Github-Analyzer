import { createClient } from "redis";

const redisUrl = process.env.REDIS_PUBLIC_URL;

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
    console.error(
        "Erro na conexão com Redis:",
        error
    );
});

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}

export async function connectRedis() {
    if (redis.isOpen) {
        return redis;
    }

    if (redis.isReady) {
        return redis;
    }

    await redis.connect();

    return redis;
}