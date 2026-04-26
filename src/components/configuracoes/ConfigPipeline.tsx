"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { createStage, updateStage, deleteStage } from "@/server/actions/pipeline-stages"

interface Stage {
  id: string
  name: string
  color: string
  order: number
  probability: number
  rottingDays: number
}

const COLORS = ["#64748B", "#06B6D4", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899"]

export function ConfigPipeline({ stages: initial }: { stages: Stage[] }) {
  const [stages, setStages] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#06B6D4")
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  async function handleAdd() {
    if (!newName.trim()) return
    try {
      const s = await createStage({ name: newName.trim(), color: newColor })
      setStages((prev) => [...prev, s])
      setNewName("")
      setAdding(false)
      toast.success("Etapa criada!")
    } catch {
      toast.error("Erro ao criar etapa")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta etapa? Os deals serão mantidos.")) return
    try {
      await deleteStage(id)
      setStages((prev) => prev.filter((s) => s.id !== id))
      toast.success("Etapa removida")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover etapa")
    }
  }

  async function handleSaveEdit(id: string) {
    try {
      await updateStage(id, { name: editName })
      setStages((prev) => prev.map((s) => s.id === id ? { ...s, name: editName } : s))
      setEditId(null)
      toast.success("Etapa atualizada!")
    } catch {
      toast.error("Erro ao atualizar etapa")
    }
  }

  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-3">
      {stages.map((stage) => (
        <div key={stage.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
          {editId === stage.id ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(stage.id) }}
              className="h-7 text-sm bg-white/5 border-white/10 flex-1"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm font-medium">{stage.name}</span>
          )}
          <span className="text-xs text-muted-foreground">{stage.probability}%</span>
          <div className="flex gap-1">
            {editId === stage.id ? (
              <>
                <Button size="sm" className="h-7 text-xs px-2" onClick={() => handleSaveEdit(stage.id)}>Salvar</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditId(null)}>✕</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditId(stage.id); setEditName(stage.name) }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(stage.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}

      {adding ? (
        <div className="flex flex-col gap-3 rounded-lg bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nome da etapa"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
              className="h-8 bg-white/5 border-white/10 text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={cn("h-6 w-6 rounded-full border-2 transition-all", newColor === c ? "border-white scale-110" : "border-transparent")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd}>Criar</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Etapa
        </Button>
      )}
    </div>
  )
}
