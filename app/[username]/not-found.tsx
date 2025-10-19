import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Perfil no encontrado</h2>
          <p className="text-muted-foreground">Este nombre de usuario no existe o el perfil ha sido eliminado.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full">Volver al inicio</Button>
          </Link>
          <Link href="/crear">
            <Button variant="outline" className="w-full bg-transparent">
              Crear mi minibio
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
