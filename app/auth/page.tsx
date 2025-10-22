import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default async function AuthLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  const target = redirect && redirect.startsWith("/") ? redirect : "/crear"

  const options = [
    {
      title: "Ya tengo cuenta",
      description: "Ingresa con tu correo y contraseña para administrar tu minibio.",
      href: `/auth/sign-in?redirect=${encodeURIComponent(target)}`,
      actionLabel: "Iniciar sesión",
    },
    {
      title: "Soy nuevo en minibio",
      description: "Crea una cuenta gratuita y diseña tu página en pocos pasos.",
      href: `/auth/sign-up?redirect=${encodeURIComponent(target)}`,
      actionLabel: "Registrarme",
    },
  ]

  const glassCardClass =
    "rounded-3xl border border-white/10 bg-[#101013]/70 backdrop-blur-2xl shadow-[0_45px_120px_-70px_rgba(0,0,0,0.85)]"

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[20%] h-[26rem] w-[26rem] rounded-full bg-white/6 blur-[160px]" />
        <div className="absolute right-[-18%] top-[-15%] h-[30rem] w-[30rem] rounded-full bg-white/5 blur-[170px]" />
        <div className="absolute bottom-[-28%] left-[40%] h-[34rem] w-[34rem] rounded-full bg-white/4 blur-[200px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold">Vamos a crear tu minibio</h1>
            <p className="text-white/60">
              Para guardar tu perfil y editarlo cuando quieras, primero iniciá sesión o registrate.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {options.map((option) => (
              <Card key={option.href} className={cn(glassCardClass, "p-6 flex flex-col justify-between space-y-6")}>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{option.title}</h2>
                  <p className="text-white/60 text-sm leading-relaxed">{option.description}</p>
                </div>
                <Button asChild size="lg" className="w-full rounded-full bg-gradient-to-r from-[#4d4d50] via-[#1e1e20] to-[#4d4d50] text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] transition-all duration-300 hover:scale-105 hover:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.9)] hover:bg-gradient-to-r hover:from-[#5a5a5d] hover:via-[#2a2a2d] hover:to-[#5a5a5d] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30">
                  <Link href={option.href}>{option.actionLabel}</Link>
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center text-sm text-white/35">
            ¿Tenés dudas?{" "}
            <a
              href="https://www.instagram.com/leandroriviello"
              target="_blank"
              rel="noreferrer"
              className="text-white/60 underline underline-offset-4 hover:text-white/80 transition-colors"
            >
              Contáctame
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
