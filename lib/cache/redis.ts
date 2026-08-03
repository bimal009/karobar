import { Redis } from "@upstash/redis"

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

if (!REDIS_URL) throw new Error("REDIS_URL is not set")
if (!REDIS_TOKEN) throw new Error("REDIS_TOKEN is not set")

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
})

export default redis
