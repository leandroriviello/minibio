"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert("Autenticación próximamente. Por ahora dirígete al registro para crear tu cuenta.")
      router.push("/auth")
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Iniciar sesión</h1>
          <p className="text-muted-foreground text-sm">
            Ingresa con tu correo y contraseña para administrar tu minibio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="tu@correo.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="******" required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          ¿Aún no tenés cuenta?{" "}
          <Link href="/auth/sign-up" className="text-primary underline underline-offset-4">
            Registrate
          </Link>
        </div>
      </Card>
    </div>
  )
}
