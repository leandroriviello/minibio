import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">minibio</h1>
          <p className="text-muted-foreground text-lg">Crea tu página de perfil personalizada en segundos</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/auth">
            <Button size="lg" className="w-full">
              Crear mi minibio
            </Button>
          </Link>

          <Link href="/leandroriviello">
            <Button variant="outline" size="lg" className="w-full bg-transparent">
              Ver ejemplo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
