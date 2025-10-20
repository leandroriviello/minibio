"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import Image, { type ImageLoader } from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fileToDataUrl } from "@/lib/files"
import { createEmptySocialLinks, type SocialLinkFormValue } from "@/lib/social-links"

interface CustomLink {
  id: string
  title: string
  url: string
}

interface Profile {
  username: string
  display_name: string
  bio: string | null
  profile_image_url: string | null
  social_links: Record<string, string>
  custom_links: Array<{ title: string; url: string }>
}

const externalImageLoader: ImageLoader = ({ src }) => src

export default function EditarPage(props: { params: Promise<{ username: string }> }) {
  const { username } = use(props.params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Form state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState<string>("")
  const [socialLinks, setSocialLinks] = useState<SocialLinkFormValue[]>(createEmptySocialLinks)
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profiles?username=${username}`)
        if (!response.ok) {
          throw new Error("Perfil no encontrado")
        }
        const profile: Profile = await response.json()

        setDisplayName(profile.display_name)
        setBio(profile.bio || "")
        setProfileImage(profile.profile_image_url || "")

        // Load social links
        const loadedSocialLinks = createEmptySocialLinks().map((link) => ({
          ...link,
          url: profile.social_links[link.platform] || "",
        }))
        setSocialLinks(loadedSocialLinks)

        // Load custom links
        const loadedCustomLinks = (profile.custom_links || []).map((link, index) => ({
          ...link,
          id: `${Date.now()}-${index}`,
        }))
        setCustomLinks(loadedCustomLinks)
      } catch (error) {
        console.error("Error loading profile:", error)
        alert("Error al cargar el perfil")
        router.push("/")
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [username, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 2MB")
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

  const addCustomLink = () => {
    setCustomLinks([...customLinks, { id: Date.now().toString(), title: "", url: "" }])
  }

  const removeCustomLink = (id: string) => {
    setCustomLinks(customLinks.filter((link) => link.id !== id))
  }

  const updateCustomLink = (id: string, field: "title" | "url", value: string) => {
    setCustomLinks(customLinks.map((link) => (link.id === id ? { ...link, [field]: value } : link)))
  }

  const updateSocialLink = (platform: string, url: string) => {
    setSocialLinks(socialLinks.map((link) => (link.platform === platform ? { ...link, url } : link)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName) {
      alert("Por favor completa el nombre a mostrar")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          display_name: displayName,
          bio,
          profile_image_url: profileImage,
          social_links: Object.fromEntries(
            socialLinks.filter((link) => link.url).map((link) => [link.platform, link.url]),
          ),
          custom_links: customLinks
            .filter((link) => link.title && link.url)
            .map((link) => ({ title: link.title, url: link.url })),
        }),
      })

      if (!response.ok) {
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

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href={`/${username}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold">Editar perfil</h1>
            <p className="text-muted-foreground">Actualiza tu información</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <Card className="p-6 space-y-4">
            <Label>Foto de perfil</Label>
            <div className="flex flex-col items-center gap-4">
              {profileImage ? (
                <div className="relative">
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    loader={externalImageLoader}
                    unoptimized
                    className="w-32 h-32 rounded-full object-cover border-4 border-white"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-white">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="w-full">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && <p className="text-sm text-muted-foreground mt-2">Procesando imagen...</p>}
              </div>
            </div>
          </Card>

          {/* Basic Info */}
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input id="username" value={username} disabled className="bg-secondary" />
              <p className="text-xs text-muted-foreground">El nombre de usuario no se puede cambiar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre a mostrar *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu Nombre"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
              />
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-6 space-y-4">
            <Label>Redes sociales</Label>
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <div key={link.platform} className="space-y-1">
                  <Label htmlFor={link.platform} className="text-sm capitalize">
                    {link.platform}
                  </Label>
                  <Input
                    id={link.platform}
                    value={link.url}
                    onChange={(e) => updateSocialLink(link.platform, e.target.value)}
                    placeholder={`https://...`}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Custom Links */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enlaces personalizados</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCustomLink}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar enlace
              </Button>
            </div>

            <div className="space-y-4">
              {customLinks.map((link) => (
                <div key={link.id} className="space-y-2 p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={link.title}
                        onChange={(e) => updateCustomLink(link.id, "title", e.target.value)}
                        placeholder="Título del enlace"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updateCustomLink(link.id, "url", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomLink(link.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Link href={`/${username}`} className="flex-1">
              <Button type="button" variant="outline" size="lg" className="w-full bg-transparent">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" size="lg" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
