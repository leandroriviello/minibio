import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { NextResponse } from "next/server"
import { getUserById, type User } from "@/lib/db"

const SESSION_COOKIE_NAME = "minibio_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 días
const SESSION_ISSUER = "minibio.app"

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET debe estar definido y contener al menos 32 caracteres.")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setSubject(userId)
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: SESSION_ISSUER,
    })

    const uid = typeof payload.uid === "string" ? payload.uid : payload.sub

    if (!uid || typeof uid !== "string") {
      return null
    }

    return { userId: uid }
  } catch (error) {
    console.warn("[minibio] Sesión inválida:", error)
    return null
  }
}

export function attachSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  return response
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  if (!sessionCookie?.value) {
    return null
  }

  const session = await verifySessionToken(sessionCookie.value)
  if (!session?.userId) {
    return null
  }

  return getUserById(session.userId)
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("No autorizado")
  }
  return user
}
