import { connectRedis } from "./redis-client";

const REDIS_TTL_SECONDS = 60 * 60 * 24;

export async function setRedisJson<T>(
    key: string,
    value: T,
    ttlSeconds = REDIS_TTL_SECONDS
): Promise<void> {
    const client = await connectRedis();
    await client.set(key, JSON.stringify(value), {
        EX: ttlSeconds,
    });
}
export async function getRedisJson<T>(
    key: string
): Promise<T | null> {
    const client = await connectRedis();
    const value = await client.get(key);
    if (!value) {
        return null;
    }
    return JSON.parse(value) as T;
}
export async function deleteRedisKey(
    key: string
): Promise<void> {
    const client = await connectRedis();
    await client.del(key);
}
export async function refreshRedisTtl(
    key: string,
    ttlSeconds = REDIS_TTL_SECONDS
): Promise<number> {
    const client = await connectRedis();
    return client.expire(key, ttlSeconds);
}