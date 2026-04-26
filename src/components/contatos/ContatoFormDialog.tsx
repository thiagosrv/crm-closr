"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createContact, updateContact } from "@/server/actions/contacts"
import { cn } from "@/lib/utils"
import Link from "next/link"

const schema = z.object({
  firstName: z.string().min(1, "Nome obrigatório"),
  lastName: z.string().min(1, "Sobrenome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  source: z.string().optional(),
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

interface ContatoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    whatsapp?: string | null
    company?: string | null
    position?: string | null
    city?: string | null
    state?: string | null
    source: string
  }
}

export function ContatoFormDialog({ open, onOpenChange, contact }: ContatoFormDialogProps) {
  const [limitReached, setLimitReached] = useState(false)
  const isEdit = !!contact

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: contact
      ? {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          whatsapp: contact.whatsapp ?? "",
          company: contact.company ?? "",
          position: contact.position ?? "",
          city: contact.city ?? "",
          state: contact.state ?? "",
          source: contact.source ?? "MANUAL",
        }
      : { source: "MANUAL" },
  })

  async function onSubmit(data: FormData) {
    try {
      if (isEdit) {
        await updateContact(contact.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || undefined,
          phone: data.phone || undefined,
          whatsapp: data.whatsapp || undefined,
          company: data.company || undefined,
          position: data.position || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
        })
        toast.success("Contato atualizado com sucesso!")
      } else {
        await createContact({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || undefined,
          phone: data.phone || undefined,
          whatsapp: data.whatsapp || undefined,
          company: data.company || undefined,
          position: data.position || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          source: data.source || "MANUAL",
        })
        toast.success("Contato criado com sucesso!")
        reset()
      }
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido"
      if (message.toLowerCase().includes("limite")) {
        setLimitReached(true)
      } else {
        toast.error(message)
      }
    }
  }

  function handleClose() {
    setLimitReached(false)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 60%)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold">
            {isEdit ? "Editar Contato" : "Novo Contato"}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {limitReached ? (
          /* Upgrade modal */
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10">
              <Sparkles className="h-7 w-7 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">Limite de contatos atingido</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O plano Free permite até 10 contatos. Faça upgrade para Diamond e
                tenha contatos ilimitados.
              </p>
            </div>
            <Link
              href="/planos"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff" }}
              onClick={handleClose}
            >
              <Sparkles className="h-4 w-4" />
              Fazer Upgrade
            </Link>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Nome *</Label>
                <Input id="firstName" placeholder="João" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input id="lastName" placeholder="Silva" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="joao@empresa.com" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 9999-9999" {...register("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+55</span>
                  <Input id="whatsapp" className="pl-10" placeholder="11 9 9999-9999" {...register("whatsapp")} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" placeholder="Acme Corp" {...register("company")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="position">Cargo</Label>
                <Input id="position" placeholder="CEO" {...register("position")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="São Paulo" {...register("city")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="SP" maxLength={2} {...register("state")} />
              </div>
            </div>

            {!isEdit && (
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
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : isEdit ? "Salvar" : "Criar Contato"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
