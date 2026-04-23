import { rateLimitter } from "@/middleware/rate-limitter.middleware";

export const withRateLimit = (
  config: { capacity: number; refillRate: number },
  ...handlers: any[]
) => {
  return [rateLimitter(config), ...handlers];
};
