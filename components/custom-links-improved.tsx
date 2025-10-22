"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, Search, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Íconos disponibles para los enlaces
const availableIcons = [
  { value: "link", label: "Enlace", icon: "🔗" },
  { value: "website", label: "Sitio web", icon: "🌐" },
  { value: "portfolio", label: "Portfolio", icon: "💼" },
  { value: "blog", label: "Blog", icon: "📝" },
  { value: "newsletter", label: "Newsletter", icon: "📧" },
  { value: "shop", label: "Tienda", icon: "🛒" },
  { value: "app", label: "App", icon: "📱" },
  { value: "tool", label: "Herramienta", icon: "🛠️" },
  { value: "game", label: "Juego", icon: "🎮" },
  { value: "music", label: "Música", icon: "🎵" },
  { value: "video", label: "Video", icon: "🎬" },
  { value: "book", label: "Libro", icon: "📚" },
  { value: "course", label: "Curso", icon: "🎓" },
  { value: "event", label: "Evento", icon: "📅" },
  { value: "community", label: "Comunidad", icon: "👥" },
  { value: "support", label: "Soporte", icon: "🆘" },
  { value: "contact", label: "Contacto", icon: "📞" },
  { value: "about", label: "Acerca de", icon: "ℹ️" },
  { value: "gallery", label: "Galería", icon: "🖼️" },
  { value: "download", label: "Descarga", icon: "⬇️" },
  { value: "star", label: "Destacado", icon: "⭐" },
  { value: "heart", label: "Favorito", icon: "❤️" },
  { value: "fire", label: "Trending", icon: "🔥" },
  { value: "rocket", label: "Lanzamiento", icon: "🚀" },
  { value: "profile", label: "Mi perfil", icon: "👤" },
  { value: "webpage", label: "Página web", icon: "📄" },
]

export interface CustomLink {
  id: string
  title: string
  url: string
  icon: string
}

interface CustomLinksProps {
  customLinks: CustomLink[]
  onUpdateCustomLinks: (links: CustomLink[]) => void
  glassCardClass: string
  inputClass: string
}

export function CustomLinks({ 
  customLinks, 
  onUpdateCustomLinks, 
  glassCardClass, 
  inputClass 
}: CustomLinksProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Filtrar enlaces basado en la búsqueda
  const filteredLinks = useMemo(() => {
    if (!searchTerm.trim()) return customLinks
    
    const term = searchTerm.toLowerCase()
    return customLinks.filter(link => 
      link.title.toLowerCase().includes(term) || 
      link.url.toLowerCase().includes(term)
    )
  }, [customLinks, searchTerm])

  // Mostrar solo los primeros 5 o todos según el estado
  const displayedLinks = useMemo(() => {
    if (showAll || isEditing) return filteredLinks
    return filteredLinks.slice(0, 5)
  }, [filteredLinks, showAll, isEditing])

  const addCustomLink = () => {
    const newLink: CustomLink = {
      id: Date.now().toString(),
      title: "",
      url: "",
      icon: "🔗"
    }
    onUpdateCustomLinks([...customLinks, newLink])
    setIsEditing(true)
  }

  const removeCustomLink = (id: string) => {
    onUpdateCustomLinks(customLinks.filter(link => link.id !== id))
  }

  const updateCustomLink = (id: string, field: keyof CustomLink, value: string) => {
    onUpdateCustomLinks(
      customLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    )
  }

  const moveLink = (fromIndex: number, toIndex: number) => {
    const newLinks = [...customLinks]
    const [movedLink] = newLinks.splice(fromIndex, 1)
    newLinks.splice(toIndex, 0, movedLink)
    onUpdateCustomLinks(newLinks)
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

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }

  const hasMoreLinks = filteredLinks.length > 5 && !showAll && !isEditing
  const showSearch = customLinks.length > 0

  return (
    <Card className={cn(glassCardClass, "p-8 space-y-6")}>
      <div className="flex items-center justify-between">
        <Label className="text-white/70">Enlaces personalizados</Label>
        <Button
          type="button"
          onClick={addCustomLink}
          className="rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 transition-all duration-200 hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar enlace
        </Button>
      </div>

      {/* Buscador */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            type="text"
            placeholder="Buscar enlaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(inputClass, "pl-10")}
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/40 hover:text-white/60"
            >
              ×
            </Button>
          )}
        </div>
      )}

      {/* Lista de enlaces */}
      <div className="space-y-4">
        {displayedLinks.map((link, index) => (
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

              {/* Contenido del enlace */}
              <div className="flex-1 space-y-3 min-w-0">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Select value={link.icon} onValueChange={(value) => updateCustomLink(link.id, "icon", value)}>
                        <SelectTrigger className="w-12 h-8 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#101013] border-white/10 max-h-60 overflow-y-auto">
                          <div className="grid grid-cols-6 gap-1 p-2">
                            {availableIcons.map((icon) => (
                              <SelectItem 
                                key={icon.value} 
                                value={icon.icon} 
                                className="text-white hover:bg-white/10 p-2 h-10 w-10 flex items-center justify-center"
                              >
                                <span className="text-lg">{icon.icon}</span>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      <Input
                        value={link.title}
                        onChange={(event) => updateCustomLink(link.id, "title", event.target.value)}
                        placeholder="Título del enlace"
                        className={inputClass}
                      />
                    </div>
                    <Input
                      value={link.url}
                      onChange={(event) => updateCustomLink(link.id, "url", event.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{link.icon}</span>
                      <div className="text-sm font-medium text-white">{link.title}</div>
                    </div>
                    <div className="text-xs text-white/60 break-all overflow-hidden">
                      <span className="inline-block max-w-full truncate" title={link.url}>
                        {truncateUrl(link.url)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isEditing && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-8 w-8 text-white/60 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomLink(link.id)}
                  className="h-8 w-8 text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="h-4 w-4" />
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
        ))}

        {/* Estado vacío */}
        {customLinks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/40 mb-4">
              Podés sumar links a tu web, newsletter o cualquier otro destino.
            </p>
            <Button
              type="button"
              onClick={addCustomLink}
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar tu primer enlace
            </Button>
          </div>
        ) : null}

        {/* Sin resultados de búsqueda */}
        {searchTerm && filteredLinks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-white/40">
              No se encontraron enlaces que coincidan con &quot;{searchTerm}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          {customLinks.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white/60 hover:text-white/80 hover:bg-white/10"
            >
              {isEditing ? "Ver enlaces" : "Editar orden"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasMoreLinks && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAll(true)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Ver más ({filteredLinks.length - 5} más)
            </Button>
          )}
          
          {showAll && !isEditing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(false)}
              className="text-white/60 hover:text-white/80"
            >
              Ver menos
            </Button>
          )}
        </div>
      </div>

      {/* Info de orden - solo visible en modo edición */}
      {isEditing && customLinks.length > 1 && (
        <div className="text-xs text-white/35 text-center pt-2 border-t border-white/10">
          💡 Arrastrá los enlaces para cambiar su orden
        </div>
      )}
    </Card>
  )
}
