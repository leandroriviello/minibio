"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CustomLink {
  id: string
  title: string
  url: string
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

  const addCustomLink = () => {
    const newLink: CustomLink = {
      id: Date.now().toString(),
      title: "",
      url: ""
    }
    onUpdateCustomLinks([...customLinks, newLink])
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

      <div className="space-y-4">
        {customLinks.map((link, index) => (
          <div
            key={link.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group rounded-2xl border border-white/12 bg-white/6 p-4 backdrop-blur-2xl shadow-inner transition-all duration-200",
              "hover:border-white/20 hover:bg-white/8",
              "cursor-move",
              draggedIndex === index && "opacity-50 scale-95"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Drag handle */}
              <div className="flex items-center justify-center h-10 w-6 text-white/40 group-hover:text-white/60 transition-colors cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Input fields */}
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

              {/* Delete button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCustomLink(link.id)}
                className="mt-1 h-8 w-8 text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 hover:scale-110"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Drag indicator */}
            <div className="mt-2 text-xs text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
              Arrastrá para reordenar
            </div>
          </div>
        ))}

        {customLinks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/40 mb-4">
              Podés sumar links a tu web, newsletter o cualquier otro destino.
            </p>
            <Button
              type="button"
              onClick={addCustomLink}
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar tu primer enlace
            </Button>
          </div>
        ) : null}
      </div>

      {/* Order info */}
      {customLinks.length > 1 && (
        <div className="text-xs text-white/35 text-center pt-2 border-t border-white/10">
          💡 Arrastrá los enlaces para cambiar su orden
        </div>
      )}
    </Card>
  )
}
