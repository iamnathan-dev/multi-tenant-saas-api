export const rateLimits = {
  STRICT: { capacity: 5, refillRate: 0.1 },
  VERY_STRICT: { capacity: 2, refillRate: 0.03 },
  PASSWORD: { capacity: 3, refillRate: 0.05 },
  RELAXED: { capacity: 20, refillRate: 2 },
  LOOSE: { capacity: 50, refillRate: 5 },
  OAUTH: { capacity: 10, refillRate: 1 },
};
