import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const glassCardClass =
    "rounded-3xl border border-white/10 bg-[#101013]/70 backdrop-blur-2xl shadow-[0_45px_120px_-70px_rgba(0,0,0,0.85)]"

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-20%] top-[20%] h-[26rem] w-[26rem] rounded-full bg-white/6 blur-[160px]" />
        <div className="absolute right-[-18%] top-[-15%] h-[30rem] w-[30rem] rounded-full bg-white/5 blur-[170px]" />
        <div className="absolute bottom-[-28%] left-[40%] h-[34rem] w-[34rem] rounded-full bg-white/4 blur-[200px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <Card className={cn(glassCardClass, "max-w-xl w-full px-10 py-12 text-center space-y-10")}
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight">minibio</h1>
            <p className="text-white/60 text-base md:text-lg">
              Tu tarjeta personal, simple.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/auth">
              <Button
                size="lg"
                className="w-full rounded-full bg-gradient-to-r from-[#4d4d50] via-[#1e1e20] to-[#4d4d50] text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] transition-all duration-300 hover:scale-105 hover:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.9)] hover:bg-gradient-to-r hover:from-[#5a5a5d] hover:via-[#2a2a2d] hover:to-[#5a5a5d] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30"
              >
                Crear/modificar mi minibio
              </Button>
            </Link>

            <Link href="/leandroriviello" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full border-white/20 bg-white/10 text-white shadow-[0_20px_40px_-30px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:text-white hover:border-white/30 hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.8)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30 cursor-pointer"
              >
                Ver ejemplo
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
