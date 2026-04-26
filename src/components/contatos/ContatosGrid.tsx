"use client"

import { useState } from "react"
import { Search, Plus, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { ContatoCard } from "./ContatoCard"
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

interface ContatosGridProps {
  contacts: Contact[]
  total: number
}

export function ContatosGrid({ contacts, total }: ContatosGridProps) {
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = contacts.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q)
    )
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contatos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {total} contato{total !== 1 ? "s" : ""}
          </span>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "Nenhum contato encontrado" : "Nenhum contato ainda"}
          description={
            search
              ? "Tente buscar por outro nome, email ou empresa."
              : "Comece adicionando seu primeiro contato."
          }
          action={
            !search
              ? { label: "Novo Contato", onClick: () => setCreateOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((contact) => (
            <ContatoCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}

      <ContatoFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
