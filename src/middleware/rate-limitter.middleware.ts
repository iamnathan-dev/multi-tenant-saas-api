import { redis } from "@/lib/redis";
import { NextFunction, Request, Response } from "express";

interface RateLimitOptions {
  capacity: number; // max tokens
  refillRate: number; // tokens per second
}

export const rateLimitter = (options: RateLimitOptions) => {
  const { capacity, refillRate } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id || req.ip; // Use user ID if available, otherwise fallback to IP
      const key = `rate_limit:${userId}`;

      const now = Date.now();

      // get bucket from Redis
      const data = await redis.hgetall(key);

      let tokens = capacity;
      let lastRefill = now;

      if (data.tokens && data.lastRefill) {
        tokens = parseFloat(data.tokens);
        lastRefill = parseInt(data.lastRefill);

        // Refill tokens
        const elapsed = (now - lastRefill) / 1000; // seconds
        const refill = elapsed * refillRate;

        tokens = Math.min(capacity, tokens + refill);
      }

      if (tokens < 1) {
        return res
          .status(429)
          .json({ message: "Too many requests. Please try again later." });
      }

      // Consume a token
      tokens -= 1;

      // Save updated bucket back to Redis
      await redis.hmset(key, {
        tokens,
        lastRefill: now,
      });

      await redis.expire(key, Math.ceil(capacity / refillRate));

      next();
    } catch (err) {
      console.log("Rate Limitter Error:", err);
      next();
    }
  };
};
