"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import {
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Zap,
  LogOut,
  Gem,
  Menu,
  X,
  Building2,
} from "lucide-react"

const navItems = [
  { label: "Início",               href: "/inicio",           icon: LayoutDashboard },
  { label: "Meus Clientes Ativos", href: "/clientes-ativos",  icon: Building2 },
  { label: "Comunicações",         href: "/comunicacoes",     icon: MessageSquare },
  { label: "Funis de Venda",       href: "/funis",            icon: Kanban },
  { label: "Calendário",           href: "/calendario",       icon: Calendar },
  { label: "Listas de Contatos",   href: "/contatos",         icon: Users },
  { label: "Insights",             href: "/insights",         icon: BarChart3 },
  { label: "Configurações",        href: "/configuracoes",    icon: Settings },
]

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const user      = session?.user
  const plano     = (user as { plano?: string } | undefined)?.plano ?? "FREE"
  const isDiamond = plano === "DIAMOND"
  const initials  = user?.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "U"

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="flex flex-col h-full select-none" style={{ background: "#0F2044" }}>
      {/* Logo */}
      <div
        className="flex items-center justify-between px-5 py-5 shrink-0"
        style={{ borderBottom: "2px solid #1A3366" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{ background: "#84CC16", border: "2px solid #84CC16" }}
          >
            <Zap className="w-4 h-4 text-[#0F2044]" fill="#0F2044" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white" style={{ letterSpacing: "-0.05em" }}>
            CLOSR
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-2 py-2.5 text-sm font-bold transition-all rounded-[2px]"
              style={isActive ? {
                background: "#84CC16",
                color: "#0F2044",
                borderLeft: "4px solid #0F2044",
              } : {
                color: "rgba(255,255,255,0.65)",
                borderLeft: "4px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)"
                  e.currentTarget.style.color = "#FFFFFF"
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "rgba(255,255,255,0.65)"
                }
              }}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 shrink-0 space-y-3" style={{ borderTop: "2px solid #1A3366" }}>
        {!isDiamond && (
          <Link
            href="/plano-diamond"
            onClick={onClose}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-black transition-all"
            style={{
              background: "#84CC16",
              border: "2px solid #84CC16",
              boxShadow: "3px 3px 0 rgba(132,204,22,0.3)",
              borderRadius: "2px",
              color: "#0F2044",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "4px 4px 0 rgba(132,204,22,0.5)"
              e.currentTarget.style.transform = "translate(-1px,-1px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "3px 3px 0 rgba(132,204,22,0.3)"
              e.currentTarget.style.transform = ""
            }}
          >
            <Gem className="w-4 h-4 shrink-0" />
            <span>Fazer Upgrade</span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 shrink-0 flex items-center justify-center text-xs font-black"
            style={{ background: "#FFFFFF", border: "2px solid #84CC16", color: "#0F2044", borderRadius: "2px" }}
          >
            {initials}
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">{user?.name ?? "Usuário"}</p>
            <p className="text-[10px] text-white/40 truncate leading-tight">
              {isDiamond ? "Diamond ✦" : "Plano Free"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="shrink-0 w-8 h-8 flex items-center justify-center transition-all rounded-[2px]"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)"
              e.currentTarget.style.color = "#EF4444"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "rgba(255,255,255,0.4)"
            }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  /* Close drawer on navigation */
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.overscrollBehavior = "none"
    } else {
      document.body.style.overflow = ""
      document.body.style.overscrollBehavior = ""
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.overscrollBehavior = ""
    }
  }, [drawerOpen])

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ overscrollBehavior: "none", background: "#F4F4F4" }}
    >
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col h-screen shrink-0"
        style={{ width: 240, minWidth: 240, borderRight: "3px solid #1A3366" }}
      >
        <SidebarNav />
      </aside>

      {/* ── Mobile overlay drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          style={{ background: "rgba(15,32,68,0.65)" }}
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            className="flex flex-col h-full shrink-0"
            style={{ width: 260, borderRight: "3px solid #1A3366" }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarNav onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Right column: mobile topbar + page content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: "#0F2044", borderBottom: "2px solid #1A3366" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 flex items-center justify-center"
              style={{ background: "#84CC16", border: "2px solid #84CC16" }}
            >
              <Zap className="w-3.5 h-3.5 text-[#0F2044]" fill="#0F2044" />
            </div>
            <span className="text-xl font-black text-white" style={{ letterSpacing: "-0.05em" }}>CLOSR</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white/60 hidden sm:block">
              {user?.name?.split(" ")[0]}
            </span>
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-white transition-colors"
              style={{ border: "2px solid #1A3366", borderRadius: "2px" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#84CC16" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A3366" }}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ overscrollBehavior: "none" }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
