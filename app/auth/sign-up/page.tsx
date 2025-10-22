"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") ?? "/crear"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        throw new Error(data.error || "No se pudo crear la cuenta")
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      console.error("Error al crear cuenta:", err)
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta")
      setLoading(false)
    }
  }

  const glassCardClass =
    "rounded-3xl border border-white/10 bg-[#101013]/70 backdrop-blur-2xl shadow-[0_45px_120px_-70px_rgba(0,0,0,0.85)]"

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[20%] h-[26rem] w-[26rem] rounded-full bg-white/6 blur-[160px]" />
        <div className="absolute right-[-18%] top-[-15%] h-[30rem] w-[30rem] rounded-full bg-white/5 blur-[170px]" />
        <div className="absolute bottom-[-28%] left-[40%] h-[34rem] w-[34rem] rounded-full bg-white/4 blur-[200px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <Card className={cn(glassCardClass, "w-full max-w-md p-8 space-y-8")}>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Crear una cuenta</h1>
            <p className="text-white/60 text-sm">
              Registrate para guardar tus perfiles y personalizar tu minibio cuando quieras.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nombre completo</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Tu nombre" 
                required 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Correo electrónico</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="tu@correo.com" 
                required 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="******"
                minLength={6}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button 
              type="submit" 
              className="w-full rounded-full bg-gradient-to-r from-[#4d4d50] via-[#1e1e20] to-[#4d4d50] text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] transition-all duration-300 hover:scale-105 hover:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.9)] hover:bg-gradient-to-r hover:from-[#5a5a5d] hover:via-[#2a2a2d] hover:to-[#5a5a5d] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30" 
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </form>

          <div className="text-center text-sm text-white/60">
            ¿Ya tenés cuenta?{" "}
            <Link
              href={`/auth/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-white/80 underline underline-offset-4 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  )
}
