"use client"

import type React from "react"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fileToDataUrl } from "@/lib/files"
import { createEmptySocialLinks, type SocialLinkFormValue } from "@/lib/social-links"
import { cn } from "@/lib/utils"

type SessionUser = {
  id: string
  name: string
  email: string
}

type LoadedProfile = {
  username: string
  display_name: string
  bio: string | null
  profile_image_url: string | null
  social_links: Record<string, string>
  custom_links: Array<{ title: string; url: string }>
  user_id: string | null
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "owned"

export default function CrearPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)
  const [existingProfile, setExistingProfile] = useState(false)
  const [initialUsername, setInitialUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle")

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Form state
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState<string>("")
  const [socialLinks, setSocialLinks] = useState<SocialLinkFormValue[]>(createEmptySocialLinks)
  const [customLinks, setCustomLinks] = useState<Array<{ id: string; title: string; url: string }>>([])

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" })
        if (!sessionRes.ok) {
          router.replace("/auth?redirect=/crear")
          return
        }

        const { user } = (await sessionRes.json()) as { user: SessionUser | null }
        if (!user) {
          router.replace("/auth?redirect=/crear")
          return
        }
        setCurrentUser(user)

        const profileRes = await fetch("/api/profiles?mine=true", { credentials: "include" })
        if (profileRes.ok) {
          const profile = (await profileRes.json()) as LoadedProfile
          setExistingProfile(true)
          setInitialUsername(profile.username)
          setUsername(profile.username || "")
          setDisplayName(profile.display_name || "")
          setBio(profile.bio || "")
          setProfileImage(profile.profile_image_url || "")
          setSocialLinks(
            createEmptySocialLinks().map((link) => ({
              ...link,
              url: profile.social_links[link.platform] || "",
            })),
          )
          setCustomLinks(
            (profile.custom_links || []).map((link, index) => ({ ...link, id: `${Date.now()}-${index}` })),
          )
          setUsernameStatus("owned")
        } else {
          setExistingProfile(false)
          setInitialUsername("")
          setUsernameStatus("idle")
          setSocialLinks(createEmptySocialLinks())
          setCustomLinks([])
        }
      } catch (error) {
        console.error("Error cargando datos iniciales:", error)
        router.replace("/auth?redirect=/crear")
        return
      } finally {
        setCheckingAuth(false)
        setLoadingProfile(false)
      }
    }

    void bootstrap()
  }, [router])

  useEffect(() => {
    if (checkingAuth || loadingProfile) return

    if (!username) {
      setUsernameStatus("idle")
      return
    }

    if (existingProfile && username === initialUsername) {
      setUsernameStatus("owned")
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setUsernameStatus("checking")
      try {
        const res = await fetch(`/api/profiles?username=${encodeURIComponent(username)}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const profile = (await res.json()) as LoadedProfile
          if (currentUser && profile.user_id === currentUser.id) {
            setUsernameStatus("owned")
          } else {
            setUsernameStatus("taken")
          }
        } else if (res.status === 404) {
          setUsernameStatus("available")
        } else {
          setUsernameStatus("idle")
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setUsernameStatus("idle")
        }
      }
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [username, checkingAuth, loadingProfile, existingProfile, initialUsername, currentUser])

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
      console.error("Error procesando imagen:", error)
      alert("Error al procesar la imagen")
    } finally {
      setUploading(false)
    }
  }

  const addCustomLink = () => {
    setCustomLinks((prev) => [...prev, { id: Date.now().toString(), title: "", url: "" }])
  }

  const removeCustomLink = (id: string) => {
    setCustomLinks((prev) => prev.filter((link) => link.id !== id))
  }

  const updateCustomLink = (id: string, field: "title" | "url", value: string) => {
    setCustomLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)))
  }

  const updateSocialLink = (platform: string, url: string) => {
    setSocialLinks((prev) => prev.map((link) => (link.platform === platform ? { ...link, url } : link)))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!username || !displayName) {
      alert("Por favor completa el nombre de usuario y nombre a mostrar")
      return
    }

    if (usernameStatus === "taken") {
      alert("Ese nombre de usuario ya está en uso")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
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
          custom_links: customLinks.filter((link) => link.title && link.url),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/auth?redirect=/crear")
          return
        }
        const error = await response.json()
        throw new Error(error.error || "No se pudo guardar tu minibio")
      }

      const data = (await response.json()) as LoadedProfile
      setExistingProfile(true)
      setInitialUsername(data.username)
      setUsernameStatus("owned")
      router.push(`/${data.username}`)
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "Ocurrió un error al guardar tu minibio")
    } finally {
      setLoading(false)
    }
  }

  const availabilityInfo = useMemo(() => {
    switch (usernameStatus) {
      case "available":
        return { message: "Nombre disponible", className: "text-emerald-300" }
      case "taken":
        return { message: "Este nombre ya está en uso", className: "text-rose-400" }
      case "owned":
        return { message: "Usando tu nombre actual", className: "text-sky-300" }
      case "checking":
        return { message: "Verificando disponibilidad...", className: "text-amber-300" }
      default:
        return null
    }
  }, [usernameStatus])

  if (checkingAuth || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060f] text-white">
        <p className="text-sm text-white/60">
          {checkingAuth ? "Verificando sesión..." : "Cargando tu minibio..."}
        </p>
      </div>
    )
  }

  const actionLabel = existingProfile ? "Guardar cambios" : "Crear mi minibio"
  const isSubmitDisabled =
    loading || !username || !displayName || usernameStatus === "taken" || usernameStatus === "checking"

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
        <div className="absolute left-[-20%] top-[18%] h-[24rem] w-[24rem] rounded-full bg-white/6 blur-[150px]" />
        <div className="absolute right-[-18%] top-[-5%] h-[30rem] w-[30rem] rounded-full bg-white/5 blur-[170px]" />
        <div className="absolute bottom-[-25%] left-[35%] h-[32rem] w-[32rem] rounded-full bg-white/4 blur-[190px]" />
      </div>

      <div className="relative z-10 px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-3xl space-y-10">
          <header className="text-center space-y-3">
            <h1 className="text-4xl font-semibold md:text-5xl">Diseñá tu tarjeta digital</h1>
            <p className="mx-auto max-w-2xl text-white/60">
              Personalizá tu presencia online con un perfil tipo “liquid glass”: estilo elegante, animado y
              listo para compartir.
            </p>
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
                    {uploading ? "Procesando..." : "Seleccionar imagen"}
                  </Button>
                  <p className="text-xs text-white/45">PNG, JPG o WEBP · Máx 500KB</p>
                </div>
              </div>
            </Card>

            <Card className={cn(glassCardClass, "p-8 space-y-6")}>
              <div className="space-y-3">
                <Label htmlFor="username" className="text-white/70">
                  Nombre de usuario *
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="tunombre"
                  required
                  className={inputClass}
                />
                <div className="flex items-center justify-between text-xs">
                  <p className="text-white/45">Tu URL será: minibio.app/{username || "tunombre"}</p>
                  {availabilityInfo ? (
                    <p className={cn("font-medium", availabilityInfo.className)}>{availabilityInfo.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="displayName" className="text-white/70">
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
                <Label htmlFor="bio" className="text-white/70">
                  Biografía
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Contanos quién sos, qué hacés o qué te apasiona."
                  rows={4}
                  className={cn(inputClass, "resize-none")}
                />
              </div>
            </Card>

            <Card className={cn(glassCardClass, "p-8 space-y-5")}>
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Redes sociales</Label>
                <p className="text-xs text-white/45">Agregá sólo las que quieras mostrar</p>
              </div>
              <div className="grid gap-4">
                {socialLinks.map((link) => (
                  <div key={link.platform} className="space-y-2">
                    <Label htmlFor={link.platform} className="text-xs text-white/50">
                      {platformLabels[link.platform] ?? link.platform}
                    </Label>
                    <Input
                      id={link.platform}
                      value={link.url}
                      onChange={(event) => updateSocialLink(link.platform, event.target.value)}
                      placeholder={platformPlaceholders[link.platform] ?? "https://..."}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className={cn(glassCardClass, "p-8 space-y-6")}>
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Enlaces personalizados</Label>
                <Button
                  type="button"
                  onClick={addCustomLink}
                  className="rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-white/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar enlace
                </Button>
              </div>

              <div className="space-y-4">
                {customLinks.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-2xl border border-white/12 bg-white/6 p-4 backdrop-blur-2xl shadow-inner"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={link.title}
                          onChange={(event) => updateCustomLink(link.id, "title", event.target.value)}
                          placeholder="Título del enlace"
                          className={inputClass}
                        />
                        <Input
                          value={link.url}
                          onChange={(event) => updateCustomLink(link.id, "url", event.target.value)}
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomLink(link.id)}
                        className="mt-1 text-white/60 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {customLinks.length === 0 ? (
                  <p className="text-xs text-white/40">
                    Podés sumar links a tu web, newsletter o cualquier otro destino.
                  </p>
                ) : null}
              </div>
            </Card>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitDisabled}
              className={cn(
                "w-full rounded-full bg-gradient-to-r from-[#4d4d50] via-[#1e1e20] to-[#4d4d50] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/30",
                "shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)]",
                isSubmitDisabled && "opacity-60 cursor-not-allowed",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                actionLabel
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
