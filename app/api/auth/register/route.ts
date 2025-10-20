import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { attachSessionCookie, createSessionToken } from "@/lib/session"

interface RegisterBody {
  name?: string
  email?: string
  password?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody
    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Completa todos los campos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      )
    }

    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con este correo" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await createUser({ name, email, passwordHash })
    const token = await createSessionToken(user.id)

    const response = NextResponse.json({ user })
    attachSessionCookie(response, token)
    return response
  } catch (error) {
    console.error("[minibio] Error en registro:", error)
    return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 500 })
  }
}
