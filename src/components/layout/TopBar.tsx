"use client"

import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Bell, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"

const ROUTE_TITLES: Record<string, string> = {
  "/visao-geral": "Visão Geral",
  "/pipeline": "Pipeline",
  "/leads": "Leads",
  "/contatos": "Contatos",
  "/negociacoes": "Negociações",
  "/atividades": "Atividades",
  "/propostas": "Propostas",
  "/relatorios": "Relatórios",
  "/equipe": "Equipe",
  "/configuracoes": "Configurações",
  "/planos": "Planos",
}

function getPageTitle(pathname: string): string {
  // Exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  // Match by prefix (e.g. /contatos/123 → Contatos)
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(route + "/")) return title
  }
  return "Dashboard"
}

export function TopBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const user = session?.user
  const title = getPageTitle(pathname)

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="flex items-center justify-between px-6 py-3 shrink-0 bg-black/20 backdrop-blur-sm border-b border-white/8">
      {/* Left: page title */}
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button
          className="relative flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <Badge
            className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            3
          </Badge>
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
          >
            <Avatar className="h-8 w-8">
              {user?.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
              <AvatarFallback className="text-xs bg-cyan-500/20 text-cyan-400 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-medium text-foreground leading-tight max-w-[120px] truncate">
                {user?.name ?? "Usuário"}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight max-w-[120px] truncate">
                {user?.email ?? ""}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-card shadow-lg z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.name ?? "Usuário"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email ?? ""}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
