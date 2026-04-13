import { config } from "../config";

export const redisConfig =  {
//   url: process.env.REDIS_URL,
//  ,
  url: config.redisurl,
    socket: {
    reconnectStrategy: (retries) => {
      // reconnect forever with exponential backoff
      const delay = Math.min(retries * 100, 5000);
      console.log(`Redis reconnect attempt #${retries} (next in ${delay}ms)`);
      return delay; // returning a number means "keep retrying"
    },
  },
}