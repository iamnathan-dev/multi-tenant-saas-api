import { prisma } from "@/prisma/client";
import { generateAccessToken, generateRefreshToken } from "./generateToken";
import { REFRESH_TOKEN_TTL_MS } from "@/constant/auth.constant";

export function sanitizeUser<T extends { passwordHash?: unknown }>(user: T) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function issueTokens(userId: string) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      user: { connect: { id: userId } },
    },
  });

  return { accessToken, refreshToken };
}
