"use client"

import { useState } from "react"
import { MessageCircle, Phone, Pencil, Trash2, Building2, MapPin, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, iniciais, formatarDataRelativa } from "@/lib/utils"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import { deleteContact } from "@/server/actions/contacts"
import { toast } from "sonner"
import { ContatoFormDialog } from "./ContatoFormDialog"

interface Contact {
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
  updatedAt: Date
  _count: {
    deals: number
    leads: number
  }
}

interface ContatoCardProps {
  contact: Contact
}

export function ContatoCard({ contact }: ContatoCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fullName = `${contact.firstName} ${contact.lastName}`
  const initials = iniciais(fullName)

  async function handleDelete() {
    if (!confirm(`Excluir ${fullName}? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await deleteContact(contact.id)
      toast.success("Contato removido com sucesso.")
    } catch {
      toast.error("Erro ao remover contato.")
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="glass rounded-xl p-4 flex flex-col gap-3 animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{fullName}</p>
            {contact.position && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Briefcase className="h-3 w-3 shrink-0" />
                {contact.position}
              </p>
            )}
            {contact.company && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0" />
                {contact.company}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditOpen(true)}
              aria-label="Editar contato"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Excluir contato"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Location */}
        {(contact.city || contact.state) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {[contact.city, contact.state].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Phone + WhatsApp */}
        <div className="flex items-center gap-2">
          {contact.phone && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" />
              {contact.phone}
            </span>
          )}
          {contact.whatsapp && (
            <a
              href={buildWhatsAppUrl(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
              )}
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </a>
          )}
        </div>

        {/* Counts */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {contact._count.deals} deal{contact._count.deals !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {contact._count.leads} lead{contact._count.leads !== 1 ? "s" : ""}
          </Badge>
          <span className="ml-auto text-xs text-muted-foreground">
            {formatarDataRelativa(contact.updatedAt)}
          </span>
        </div>
      </div>

      <ContatoFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        contact={contact}
      />
    </>
  )
}
