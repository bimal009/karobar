import redis from "./redis"
import { TTL_SHORT } from "./constants"

export interface CachedPage<T> {
  rows: T[]
  total: number
}

type ListCacheParams = Record<string, string | number | boolean | undefined>

const serializeParams = (params: ListCacheParams) =>
  Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key] ?? ""}`)
    .join("&")

/** One store's list reads are cached per query shape (page/search/sort/filters), not as a single key. */
export const buildListCacheKey = (prefix: string, storeId: string, params: ListCacheParams) =>
  `${prefix}${storeId}:${serializeParams(params)}`

export async function getCachedList<T>(cacheKey: string): Promise<T | null> {
  const cached = await redis.get(cacheKey)
  return cached === null || cached === undefined ? null : (cached as T)
}

export async function setCachedList<T>(cacheKey: string, data: T, ttl: number = TTL_SHORT): Promise<void> {
  await redis.set(cacheKey, data, { ex: ttl })
}

/**
 * A mutation can't know every page/search/sort/filter combination that's been
 * cached for a store, so this clears the whole prefix rather than one exact key.
 * Each store's list cache is a small, namespaced slice of the keyspace — not the
 * whole database — so KEYS is fine here.
 */
export async function invalidateListCache(prefix: string, storeId: string): Promise<void> {
  const keys = await redis.keys(`${prefix}${storeId}:*`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
