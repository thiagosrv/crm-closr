"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createActivity } from "@/server/actions/activities"
import { cn } from "@/lib/utils"

const schema = z.object({
  type: z.enum(["NOTE", "CALL", "EMAIL", "WHATSAPP", "MEETING", "TASK"]),
  subject: z.string().min(1, "Assunto obrigatório"),
  body: z.string().optional(),
  dueAt: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const TYPE_OPTIONS = [
  { value: "NOTE", label: "Nota" },
  { value: "CALL", label: "Ligação" },
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "MEETING", label: "Reunião" },
  { value: "TASK", label: "Tarefa" },
]

interface LogAtividadeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId?: string
  dealId?: string
}

export function LogAtividadeDialog({ open, onOpenChange, contactId, dealId }: LogAtividadeDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "NOTE",
      contactId: contactId ?? "",
      dealId: dealId ?? "",
    },
  })

  async function onSubmit(data: FormData) {
    try {
      await createActivity({
        type: data.type,
        subject: data.subject,
        body: data.body,
        dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
        contactId: data.contactId || undefined,
        dealId: data.dealId || undefined,
      })
      toast.success("Atividade registrada!")
      reset()
      onOpenChange(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar atividade")
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 60%)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false) }}
    >
      <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold">Registrar Atividade</h2>
          <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              {...register("type")}
              className={cn(
                "flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm",
                "text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-background">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              placeholder="Ex: Ligação de apresentação"
              {...register("subject")}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Descrição</Label>
            <textarea
              id="body"
              {...register("body")}
              rows={4}
              placeholder="Detalhes da atividade..."
              className={cn(
                "flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
                "text-foreground placeholder:text-muted-foreground focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring resize-none"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dueAt">Prazo</Label>
            <Input
              id="dueAt"
              type="datetime-local"
              {...register("dueAt")}
            />
          </div>

          {!contactId && (
            <div className="space-y-1.5">
              <Label htmlFor="contactId">ID do Contato</Label>
              <Input
                id="contactId"
                placeholder="cuid do contato (opcional)"
                {...register("contactId")}
              />
            </div>
          )}

          {!dealId && (
            <div className="space-y-1.5">
              <Label htmlFor="dealId">ID da Negociação</Label>
              <Input
                id="dealId"
                placeholder="cuid da negociação (opcional)"
                {...register("dealId")}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
