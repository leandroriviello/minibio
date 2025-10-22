"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

// Íconos disponibles para las redes sociales
const availableIcons = [
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "tiktok", label: "TikTok", icon: "🕺" },
  { value: "twitter", label: "X (Twitter)", icon: "✖️" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "github", label: "GitHub", icon: "🐙" },
  { value: "discord", label: "Discord", icon: "💬" },
  { value: "twitch", label: "Twitch", icon: "👾" },
  { value: "spotify", label: "Spotify", icon: "🎵" },
  { value: "telegram", label: "Telegram", icon: "✈️" },
  { value: "whatsapp", label: "WhatsApp", icon: "🟢" },
  { value: "facebook", label: "Facebook", icon: "🔵" },
  { value: "snapchat", label: "Snapchat", icon: "👻" },
  { value: "pinterest", label: "Pinterest", icon: "📌" },
  { value: "reddit", label: "Reddit", icon: "👽" },
  { value: "behance", label: "Behance", icon: "🎨" },
  { value: "dribbble", label: "Dribbble", icon: "🏀" },
  { value: "medium", label: "Medium", icon: "✍️" },
  { value: "patreon", label: "Patreon", icon: "💝" },
  { value: "custom", label: "Personalizada", icon: "✨" },
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
  const [isEditing, setIsEditing] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newLink, setNewLink] = useState({
    platform: "",
    name: "",
    url: "",
    icon: "📷"
  })

  const addCustomLink = () => {
    if (!newLink.platform || !newLink.url) return

    const selectedIcon = availableIcons.find(icon => icon.value === newLink.platform)
    const link: CustomSocialLink = {
      id: Date.now().toString(),
      platform: newLink.platform,
      name: newLink.name || selectedIcon?.label || "Red social",
      url: newLink.url,
      icon: selectedIcon?.icon || "📷"
    }

    onUpdateSocialLinks([...socialLinks, link])
    setNewLink({ platform: "", name: "", url: "", icon: "📷" })
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

  const moveLink = (fromIndex: number, toIndex: number) => {
    const newLinks = [...socialLinks]
    const [movedLink] = newLinks.splice(fromIndex, 1)
    newLinks.splice(toIndex, 0, movedLink)
    onUpdateSocialLinks(newLinks)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveLink(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <Card className={cn(glassCardClass, "p-8 space-y-6")}>
      <div className="flex items-center justify-between">
        <Label className="text-white/70">Redes sociales</Label>
        <div className="flex items-center gap-2">
          {socialLinks.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white/60 hover:text-white/80 hover:bg-white/10"
            >
              {isEditing ? "Ver redes" : "Editar orden"}
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                className="rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar red
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#101013] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Agregar red social</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Red social</Label>
                  <Select value={newLink.platform} onValueChange={(value) => {
                    const iconData = availableIcons.find(icon => icon.value === value)
                    setNewLink({
                      ...newLink,
                      platform: value,
                      icon: iconData?.icon || "📷",
                      name: iconData?.label || ""
                    })
                  }}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Seleccionar red social" />
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
                  <Label className="text-white/70">Nombre personalizado (opcional)</Label>
                  <Input
                    value={newLink.name}
                    onChange={(event) => setNewLink({ ...newLink, name: event.target.value })}
                    placeholder="Ej: Mi Instagram personal"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">URL</Label>
                  <Input
                    value={newLink.url}
                    onChange={(event) => setNewLink({ ...newLink, url: event.target.value })}
                    placeholder="https://instagram.com/tu_usuario"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    onClick={addCustomLink}
                    className="flex-1 bg-gradient-to-r from-[#4d4d50] via-[#1e1e20] to-[#4d4d50] text-white hover:from-[#5a5a5d] hover:via-[#2a2a2d] hover:to-[#5a5a5d]"
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
        </div>
      </div>

      {/* Lista de redes sociales */}
      <div className="space-y-4">
        {socialLinks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/40 mb-4">
              Agregá las redes sociales que quieras mostrar en tu perfil.
            </p>
            <Button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar tu primera red social
            </Button>
          </div>
        ) : (
          socialLinks.map((link, index) => (
            <div
              key={link.id}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group rounded-2xl border border-white/12 bg-white/6 p-4 backdrop-blur-2xl shadow-inner transition-all duration-200",
                "hover:border-white/20 hover:bg-white/8",
                isEditing && "cursor-move",
                draggedIndex === index && "opacity-50 scale-95"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Drag handle - solo visible en modo edición */}
                {isEditing && (
                  <div className="flex items-center justify-center h-10 w-6 text-white/40 group-hover:text-white/60 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}

                {/* Contenido de la red social */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{link.icon}</span>
                    <div className="text-sm font-medium text-white">{link.name}</div>
                  </div>
                  <Input
                    value={link.url}
                    onChange={(event) => updateCustomLink(link.id, "url", event.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>

                {/* Botón de eliminar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCustomLink(link.id)}
                    className="h-8 w-8 text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Drag indicator - solo visible en modo edición */}
              {isEditing && (
                <div className="mt-2 text-xs text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  Arrastrá para reordenar
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info de orden - solo visible en modo edición */}
      {isEditing && socialLinks.length > 1 && (
        <div className="text-xs text-white/35 text-center pt-2 border-t border-white/10">
          💡 Arrastrá las redes sociales para cambiar su orden
        </div>
      )}
    </Card>
  )
}