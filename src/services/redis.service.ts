import  { createClient }  from "redis" ;
import { config } from "../config";
// import  { config } from "@shared/config";

export const redis = createClient({
//   url: process.env.REDIS_URL,
//  ,
  url: config.redisurl,
  //   socket: {
  //   reconnectStrategy: (retries) => {
  //     // reconnect forever with exponential backoff
  //     const delay = Math.min(retries * 100, 5000);
  //     console.log(`Redis reconnect attempt #${retries} (next in ${delay}ms)`);
  //     return delay; // returning a number means "keep retrying"
  //   },
  // },
});

// export const redis = createClient({
//     username: process.env.REDIS_USERNAME,
//     password: process.env.REDIS_PASS,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: 13090
//     }
// });

redis.on('error', (err) => console.error('Redis Error:', err));


//  redis.set("rediskey","key",{})


// import LRU from "lru-cache";
import { LRUCache  } from 'lru-cache'
// import { redis } from "./redis"; // your redis client

export class HybridCache {
  private memory: LRUCache<string, any>;

  constructor(
    private redisClient = redis,
    {
      memTTL = 5_000,     // L1 TTL (ms)
      max = 500,          // max LRU entries
    } = {}
  ) {
    this.memory = new LRUCache({
      max,
      ttl: memTTL,
      allowStale: false,
    });
  }

  /* -------------------- GET -------------------- */
  async get<T>(key: string): Promise<T | null> {
    // 1️⃣ LRU (memory)
    const memVal = this.memory.get(key);
    if (memVal !== undefined) {
      
      return memVal as T;
    }

    // 2️⃣ Redis
    const redisVal = await this.redisClient.get(key) as string |null;
    if (!redisVal) return null;

    const parsed = JSON.parse(redisVal) as T;

    // rehydrate memory
    this.memory.set(key, parsed);

    return parsed;
  }

  /* -------------------- SET -------------------- */
  async set<T>(
    key: string,
    value: T,
    redisTTLSeconds = 60
  ): Promise<void> {
    // 1️⃣ set memory
    this.memory.set(key, value);

    // 2️⃣ set redis
    await this.redisClient.set(
      key,
      JSON.stringify(value),
      { EX: redisTTLSeconds }
    );
  }

  /* -------------------- DELETE -------------------- */
  async del(key: string): Promise<void> {
    this.memory.delete(key);
    await this.redisClient.del(key);
  }

  /* -------------------- CLEAR MEMORY ONLY -------------------- */
  clearMemory() {
    this.memory.clear();
  }
}

export const Hycache = new HybridCache();