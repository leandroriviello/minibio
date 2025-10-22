"use client"

/* eslint-disable @next/next/no-img-element */
import type React from "react"
import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fileToDataUrl } from "@/lib/files"
import { createEmptySocialLinks, type SocialLinkFormValue } from "@/lib/social-links"
import { cn } from "@/lib/utils"
import { CustomSocialLinks, type CustomSocialLink } from "@/components/custom-social-links"
import { CustomLinks, type CustomLink } from "@/components/custom-links-improved"

interface Profile {
  username: string
  display_name: string
  bio: string | null
  profile_image_url: string | null
  social_links: Record<string, string>
  custom_social_links: Array<{ id: string; platform: string; name: string; url: string; icon: string }>
  custom_links: Array<{ title: string; url: string }>
  user_id: string | null
}

export default function EditarPage(props: { params: Promise<{ username: string }> }) {
  const { username } = use(props.params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState<string>("")
  const [socialLinks, setSocialLinks] = useState<SocialLinkFormValue[]>(createEmptySocialLinks)
  const [customSocialLinks, setCustomSocialLinks] = useState<CustomSocialLink[]>([])
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([])

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" })
        if (!sessionRes.ok) {
          router.replace(`/auth?redirect=/editar/${username}`)
          return
        }
        setCheckingAuth(false)

        const response = await fetch(`/api/profiles?username=${encodeURIComponent(username)}`)
        if (!response.ok) {
          throw new Error("Perfil no encontrado")
        }
        const profile = (await response.json()) as Profile

        setDisplayName(profile.display_name)
        setBio(profile.bio || "")
        setProfileImage(profile.profile_image_url || "")
        setSocialLinks(
          createEmptySocialLinks().map((link) => ({
            ...link,
            url: profile.social_links[link.platform] || "",
          })),
        )
        setCustomSocialLinks(profile.custom_social_links || [])
        setCustomLinks(
          (profile.custom_links || []).map((link, index) => ({ 
            id: `${Date.now()}-${index}`, 
            title: link.title, 
            url: link.url 
          })),
        )
      } catch (error) {
        console.error("Error loading profile:", error)
        alert("No encontramos ese perfil o no tenés permiso para editarlo.")
        router.push("/")
        return
      } finally {
        setLoadingProfile(false)
      }
    }

    void bootstrap()
  }, [username, router])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      alert("La imagen debe pesar menos de 500KB")
      return
    }

    setUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      setProfileImage(dataUrl)
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Error al procesar la imagen")
    } finally {
      setUploading(false)
    }
  }

  const updateSocialLink = (platform: string, url: string) => {
    setSocialLinks((prev) => prev.map((link) => (link.platform === platform ? { ...link, url } : link)))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!displayName) {
      alert("Por favor completa el nombre a mostrar")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          display_name: displayName,
          bio,
          profile_image_url: profileImage,
          social_links: Object.fromEntries(
            socialLinks.filter((link) => link.url).map((link) => [link.platform, link.url]),
          ),
          custom_social_links: customSocialLinks.filter((link) => link.name && link.url),
          custom_links: customLinks
            .filter((link) => link.title && link.url)
            .map((link) => ({ title: link.title, url: link.url })),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.replace(`/auth?redirect=/editar/${username}`)
          return
        }
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar el perfil")
      }

      router.push(`/${username}`)
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f] text-white">
        <p className="text-sm text-white/60">
          {checkingAuth ? "Verificando sesión..." : "Cargando tu minibio..."}
        </p>
      </div>
    )
  }

  const glassCardClass =
    "rounded-3xl border border-white/10 bg-[#101013]/70 backdrop-blur-2xl shadow-[0_25px_70px_-40px_rgba(0,0,0,0.85)]"
  const inputClass =
    "bg-white/8 border-white/15 text-white placeholder:text-white/40 focus-visible:border-white/35 focus-visible:ring-2 focus-visible:ring-white/20"

const platformLabels: Record<SocialLinkFormValue["platform"], string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "X",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  email: "Email",
}

const platformPlaceholders: Record<SocialLinkFormValue["platform"], string> = {
  instagram: "https://instagram.com/usuario",
  tiktok: "https://www.tiktok.com/@usuario",
  twitter: "https://x.com/usuario",
  youtube: "https://youtube.com/@usuario",
  linkedin: "https://linkedin.com/in/usuario",
  email: "tuemail@dominio.com",
}

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0f] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-18%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-white/6 blur-[150px]" />
        <div className="absolute right-[-15%] top-[-10%] h-[30rem] w-[30rem] rounded-full bg-white/5 blur-[170px]" />
        <div className="absolute bottom-[-25%] left-[38%] h-[32rem] w-[32rem] rounded-full bg-white/4 blur-[190px]" />
      </div>

      <div className="relative z-10 px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-3xl space-y-10">
          <header className="flex items-center justify-between">
            <Link href={`/${username}`} className="inline-flex items-center gap-2 text-white/70 hover:text-white">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="hidden text-sm uppercase tracking-[0.3em] md:inline text-white/40">
                volver
              </span>
            </Link>
            <div className="text-right">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">panel</p>
              <h1 className="text-3xl font-semibold md:text-4xl">Editá tu minibio</h1>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className={cn(glassCardClass, "p-8 space-y-6")}>
              <Label className="text-white/70">Foto de perfil</Label>
              <div className="flex flex-col items-center gap-5">
                {profileImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-32 w-32 overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-white/25 to-white/10 p-[2px] shadow-[0_20px_40px_-35px_rgba(0,0,0,0.85)] transition-transform hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30"
                  >
                    <div className="absolute inset-0 bg-white/30 opacity-0 transition-opacity group-hover:opacity-40" />
                    <img src={profileImage} alt="Profile" width={128} height={128} className="h-full w-full rounded-full object-cover" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/70 shadow-[0_20px_40px_-35px_rgba(0,0,0,0.8)] transition-transform hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30"
                  >
                    <Upload className="h-8 w-8" />
                  </button>
                )}
                <div className="text-center space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
                  >
                    {uploading ? "Procesando..." : "Actualizar imagen"}
                  </Button>
                  <p className="text-xs text-white/45">Recomendamos imágenes cuadradas · Máx 500KB</p>
                </div>
              </div>
            </Card>

            <Card className={cn(glassCardClass, "p-8 space-y-6")}>
              <div className="space-y-3">
                <Label className="text-white/70" htmlFor="username">
                  Nombre de usuario
                </Label>
                <Input
                  id="username"
                  value={username}
                  disabled
                  className={cn(inputClass, "cursor-not-allowed opacity-60 bg-white/5")}
                />
                <p className="text-xs text-white/45">Tu URL pública es minibio.app/{username}</p>
              </div>

              <div className="space-y-3">
                <Label className="text-white/70" htmlFor="displayName">
                  Nombre a mostrar *
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Tu nombre artístico o profesional"
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white/70" htmlFor="bio">
                  Biografía
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Actualizá tu texto de presentación."
                  rows={4}
                  className={cn(inputClass, "resize-none")}
                />
              </div>
            </Card>

            <CustomLinks
              customLinks={customLinks}
              onUpdateCustomLinks={setCustomLinks}
              glassCardClass={glassCardClass}
              inputClass={inputClass}
            />

            <CustomSocialLinks
              socialLinks={customSocialLinks}
              onUpdateSocialLinks={setCustomSocialLinks}
              glassCardClass={glassCardClass}
              inputClass={inputClass}
            />

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className={cn(
                "w-full rounded-full bg-gradient-to-r from-[#4d4d50] via-[#1e1e20] to-[#4d4d50] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30",
                "shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)]",
                loading && "opacity-60 cursor-not-allowed",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
