import { NextResponse } from "next/server"
import { getUserWithPasswordByEmail } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { attachSessionCookie, createSessionToken } from "@/lib/session"

interface LoginBody {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son obligatorios" }, { status: 400 })
    }

    const user = await getUserWithPasswordByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = await createSessionToken(user.id)
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    })
    attachSessionCookie(response, token)
    return response
  } catch (error) {
    console.error("[minibio] Error en login:", error)
    return NextResponse.json({ error: "No se pudo iniciar sesión" }, { status: 500 })
  }
}
