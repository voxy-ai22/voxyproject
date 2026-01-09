import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { authAttempts } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "SuperSecretJWTKey123"
);
const SESSION_EXPIRES = process.env.SESSION_EXPIRES || "1d";

export interface JWTPayload {
  role: string;
  loginAt: number;
}

export async function signJWT(payload: JWTPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRES)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getF2WStatus(ip: string) {
  const attempt = await db.query.authAttempts.findFirst({
    where: eq(authAttempts.ip, ip),
  });

  if (!attempt) return { failedAttempts: 0, lockedUntil: null };

  // Check if still locked
  if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
    const remaining = Math.ceil(
      (attempt.lockedUntil.getTime() - new Date().getTime()) / 1000
    );
    return { ...attempt, locked: true, remaining };
  }

  // If lockedUntil passed, reset locked status (but keep failedAttempts for now?)
  // Actually, usually we reset after lock expires or after success.
  return { ...attempt, locked: false };
}

export async function recordFailedAttempt(ip: string) {
  const attempt = await db.query.authAttempts.findFirst({
    where: eq(authAttempts.ip, ip),
  });

  if (!attempt) {
    await db.insert(authAttempts).values({
      ip,
      failedAttempts: 1,
      updatedAt: new Date(),
    });
    return { failedAttempts: 1, locked: false };
  }

  const newFailedAttempts = attempt.failedAttempts + 1;
  let lockedUntil = attempt.lockedUntil;

  if (newFailedAttempts >= 3) {
    lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes lock
  }

  await db
    .update(authAttempts)
    .set({
      failedAttempts: newFailedAttempts,
      lockedUntil,
      updatedAt: new Date(),
    })
    .where(eq(authAttempts.ip, ip));

  return {
    failedAttempts: newFailedAttempts,
    locked: newFailedAttempts >= 3,
    remaining: lockedUntil ? Math.ceil((lockedUntil.getTime() - Date.now()) / 1000) : 0,
  };
}

export async function resetAttempts(ip: string) {
  await db
    .update(authAttempts)
    .set({
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(authAttempts.ip, ip));
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("voxy_session")?.value;
  if (!token) return null;
  return await verifyJWT(token);
}
