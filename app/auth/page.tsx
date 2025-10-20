import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const options = [
  {
    title: "Ya tengo cuenta",
    description: "Ingresa con tu correo y contraseña para administrar tu minibio.",
    href: "/auth/sign-in",
    actionLabel: "Iniciar sesión",
  },
  {
    title: "Soy nuevo en minibio",
    description: "Crea una cuenta gratuita y diseña tu página en pocos pasos.",
    href: "/auth/sign-up",
    actionLabel: "Registrarme",
  },
]

export default function AuthLandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">Vamos a crear tu minibio</h1>
          <p className="text-muted-foreground">
            Para guardar tu perfil y editarlo cuando quieras, primero iniciá sesión o registrate.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {options.map((option) => (
            <Card key={option.href} className="p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{option.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{option.description}</p>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href={option.href}>{option.actionLabel}</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          ¿Tenés dudas?{" "}
          <a href="mailto:hola@minibio.app" className="text-primary underline underline-offset-4">
            Escribinos
          </a>
        </div>
      </div>
    </div>
  )
}
