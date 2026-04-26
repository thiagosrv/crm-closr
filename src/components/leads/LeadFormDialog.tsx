"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createLead } from "@/server/actions/leads"
import { cn } from "@/lib/utils"

const schema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  source: z.string(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED", "CONVERTED"]),
  score: z.number().min(0).max(100),
  estimatedValue: z.number().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SOURCE_OPTIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "WEBSITE", label: "Website" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "REFERRAL", label: "Indicação" },
  { value: "COLD_CALL", label: "Cold Call" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "ADS", label: "Anúncios" },
  { value: "EVENT", label: "Evento" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL", label: "Email" },
  { value: "OTHER", label: "Outro" },
]

const STATUS_OPTIONS = [
  { value: "NEW", label: "Novo" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "QUALIFIED", label: "Qualificado" },
  { value: "DISQUALIFIED", label: "Desqualificado" },
]

interface LeadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadFormDialog({ open, onOpenChange }: LeadFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      source: "MANUAL",
      status: "NEW",
      score: 0,
    },
  })

  const scoreValue = watch("score") ?? 0

  async function onSubmit(data: FormData) {
    try {
      await createLead({
        title: data.title,
        source: data.source,
        estimatedValue: data.estimatedValue,
        notes: data.notes,
        score: data.score,
        assignedToId: data.assignedToId || undefined,
      })
      toast.success("Lead criado com sucesso!")
      reset()
      onOpenChange(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar lead")
    }
  }

  function handleClose() {
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 60%)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="glass brutal-dialog rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-black tracking-tighter">Novo Lead</h2>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" placeholder="Ex: Contato via LinkedIn" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source">Origem</Label>
              <select
                id="source"
                {...register("source")}
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm",
                  "text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register("status")}
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm",
                  "text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-background">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="score">
              Score:{" "}
              <span className="font-bold text-cyan-400">{scoreValue}</span>
            </Label>
            <input
              id="score"
              type="range"
              min={0}
              max={100}
              step={5}
              {...register("score", { valueAsNumber: true })}
              className="w-full h-2 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 ${scoreValue}%, oklch(1 0 0 / 10%) ${scoreValue}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
            <Input
              id="estimatedValue"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("estimatedValue", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              {...register("notes")}
              rows={3}
              placeholder="Informações adicionais sobre o lead..."
              className={cn(
                "flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
                "text-foreground placeholder:text-muted-foreground focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring resize-none"
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
