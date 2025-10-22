"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

// Íconos disponibles para las redes sociales
const availableIcons = [
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "twitter", label: "X (Twitter)", icon: "🐦" },
  { value: "youtube", label: "YouTube", icon: "📺" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "email", label: "Email", icon: "✉️" },
  { value: "github", label: "GitHub", icon: "💻" },
  { value: "discord", label: "Discord", icon: "🎮" },
  { value: "twitch", label: "Twitch", icon: "🎯" },
  { value: "spotify", label: "Spotify", icon: "🎧" },
  { value: "telegram", label: "Telegram", icon: "✈️" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
  { value: "facebook", label: "Facebook", icon: "👥" },
  { value: "snapchat", label: "Snapchat", icon: "👻" },
  { value: "pinterest", label: "Pinterest", icon: "📌" },
  { value: "reddit", label: "Reddit", icon: "🤖" },
  { value: "behance", label: "Behance", icon: "🎨" },
  { value: "dribbble", label: "Dribbble", icon: "🏀" },
  { value: "medium", label: "Medium", icon: "📝" },
  { value: "patreon", label: "Patreon", icon: "💝" },
  { value: "custom", label: "Personalizada", icon: "🔗" },
]

export interface CustomSocialLink {
  id: string
  platform: string
  name: string
  url: string
  icon: string
}

interface CustomSocialLinksProps {
  socialLinks: CustomSocialLink[]
  onUpdateSocialLinks: (links: CustomSocialLink[]) => void
  glassCardClass: string
  inputClass: string
}

export function CustomSocialLinks({ 
  socialLinks, 
  onUpdateSocialLinks, 
  glassCardClass, 
  inputClass 
}: CustomSocialLinksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newLink, setNewLink] = useState({
    platform: "",
    name: "",
    url: "",
    icon: "🔗"
  })

  const addCustomLink = () => {
    if (!newLink.platform || !newLink.name || !newLink.url) return

    const link: CustomSocialLink = {
      id: Date.now().toString(),
      platform: newLink.platform,
      name: newLink.name,
      url: newLink.url,
      icon: newLink.icon
    }

    onUpdateSocialLinks([...socialLinks, link])
    setNewLink({ platform: "", name: "", url: "", icon: "🔗" })
    setIsDialogOpen(false)
  }

  const removeCustomLink = (id: string) => {
    onUpdateSocialLinks(socialLinks.filter(link => link.id !== id))
  }

  const updateCustomLink = (id: string, field: keyof CustomSocialLink, value: string) => {
    onUpdateSocialLinks(
      socialLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    )
  }

  const getIconEmoji = (iconValue: string) => {
    const iconData = availableIcons.find(icon => icon.value === iconValue)
    return iconData?.icon || "🔗"
  }

  return (
    <Card className={cn(glassCardClass, "p-8 space-y-5")}>
      <div className="flex items-center justify-between">
        <Label className="text-white/70">Redes sociales</Label>
        <p className="text-xs text-white/45">Agregá las redes que quieras mostrar</p>
      </div>

      {/* Redes sociales existentes */}
      <div className="grid gap-4">
        {socialLinks.map((link) => (
          <div key={link.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${link.id}-name`} className="text-xs text-white/50 flex items-center gap-2">
                <span className="text-lg">{link.icon}</span>
                {link.name}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCustomLink(link.id)}
                className="h-6 w-6 p-0 text-white/40 hover:text-red-400 hover:bg-red-400/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Input
              id={`${link.id}-url`}
              value={link.url}
              onChange={(event) => updateCustomLink(link.id, "url", event.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Botón para agregar nueva red */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar red social
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#101013] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Agregar red social</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Ícono</Label>
              <Select value={newLink.platform} onValueChange={(value) => {
                const iconData = availableIcons.find(icon => icon.value === value)
                setNewLink({
                  ...newLink,
                  platform: value,
                  icon: iconData?.icon || "🔗"
                })
              }}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Seleccionar ícono" />
                </SelectTrigger>
                <SelectContent className="bg-[#101013] border-white/10">
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value} className="text-white hover:bg-white/10">
                      <div className="flex items-center gap-2">
                        <span>{icon.icon}</span>
                        <span>{icon.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Nombre de la red</Label>
              <Input
                value={newLink.name}
                onChange={(event) => setNewLink({ ...newLink, name: event.target.value })}
                placeholder="Ej: Mi Blog, Portfolio, etc."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">URL</Label>
              <Input
                value={newLink.url}
                onChange={(event) => setNewLink({ ...newLink, url: event.target.value })}
                placeholder="https://..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={addCustomLink}
                className="flex-1 bg-gradient-to-r from-[#4d4d50] via-[#1e1e20] to-[#4d4d50] text-white hover:from-[#5a5a5d] hover:via-[#2a2a2d] hover:to-[#5a5a5d]"
                disabled={!newLink.platform || !newLink.name || !newLink.url}
              >
                Agregar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
