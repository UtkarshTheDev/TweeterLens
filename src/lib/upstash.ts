
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? (data as T) : null;
}

export async function setCache<T>(key: string, value: T, ttl: number = 600) {
  await redis.set(key, value, { ex: ttl });
}

export default redis;
