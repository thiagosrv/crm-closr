import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDashboardMetrics } from "@/server/queries/visao-geral"
import { TrendingUp, Users, Target, MessageSquare, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

export default async function InicioPage() {
  const session = await auth()

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session?.user?.id ?? "" },
        ...(session?.user?.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true, name: true },
  })

  const userId = dbUser?.id ?? session?.user?.id ?? ""

  const metrics = await getDashboardMetrics({ userId })

  // Today's activities
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayActivities = dbUser
    ? await prisma.activity.findMany({
        where: {
          userId: dbUser.id,
          dueAt: { gte: today, lt: tomorrow },
          completedAt: null,
        },
        orderBy: { dueAt: "asc" },
        take: 5,
        include: {
          contact: { select: { firstName: true, lastName: true } },
        },
      })
    : []

  // Hot deals (open, scoped to this user)
  const hotDeals = await prisma.deal.findMany({
    where: { status: "OPEN", assignedToId: userId },
    orderBy: { value: "desc" },
    take: 5,
    include: {
      stage: { select: { name: true, color: true } },
      contact: { select: { firstName: true, lastName: true } },
    },
  })

  const firstName = dbUser?.name?.split(" ")[0] ?? "usuário"

  const metricCards = [
    {
      label: "Leads Ativos",
      value: metrics.dealsRotting.length + (metrics.dealsWon ?? 0),
      sub: `${hotDeals.length} no funil agora`,
      icon: Users,
      color: "#0F2044",
    },
    {
      label: "Fechamentos",
      value: metrics.dealsWon ?? 0,
      sub: "este mês",
      icon: Target,
      color: "#84CC16",
    },
    {
      label: "Taxa de Conversão",
      value: `${metrics.taxaConversao.toFixed(1)}%`,
      sub: "do período",
      icon: TrendingUp,
      color: "#3B82F6",
    },
    {
      label: "Receita Fechada",
      value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(metrics.receitaFechada),
      sub: "este mês",
      icon: MessageSquare,
      color: "#F59E0B",
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="brutal-heading text-2xl sm:text-3xl mb-1">Olá, {firstName}! 👋</h1>
        <p className="text-[#6B7280] text-sm">Aqui está um resumo do seu negócio hoje.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="brutal-card p-4 sm:p-5"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0"
                style={{ background: m.color, border: "2px solid #0F2044" }}
              >
                <m.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">{m.sub}</span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-[#0F2044] mb-1 leading-tight">{m.value}</p>
            <p className="text-[10px] sm:text-xs font-bold text-[#6B7280] uppercase tracking-wide">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's activities */}
        <div className="brutal-card">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "2px solid #0F2044" }}
          >
            <h2 className="font-black text-[#0F2044] uppercase tracking-wide text-sm">Atividades de Hoje</h2>
            <Link
              href="/calendario"
              className="text-xs font-black text-[#84CC16] flex items-center gap-1"
              style={{ color: "#84CC16" }}
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "#0F2044" }}>
            {todayActivities.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#6B7280] text-center font-medium">
                Nenhuma atividade para hoje 🎉
              </p>
            ) : (
              todayActivities.map((act) => (
                <div key={act.id} className="px-5 py-3 flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0 text-[10px] font-black"
                    style={{ background: "#84CC16", border: "2px solid #0F2044" }}
                  >
                    <Clock className="w-4 h-4 text-[#0F2044]" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-[#0F2044] truncate">{act.subject}</p>
                    <p className="text-xs text-[#6B7280]">
                      {act.contact ? `${act.contact.firstName} ${act.contact.lastName}` : act.type}
                      {act.dueAt ? ` · ${act.dueAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hot deals */}
        <div className="brutal-card">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "2px solid #0F2044" }}
          >
            <h2 className="font-black text-[#0F2044] uppercase tracking-wide text-sm">Leads no Funil</h2>
            <Link
              href="/funis"
              className="text-xs font-black flex items-center gap-1"
              style={{ color: "#84CC16" }}
            >
              Ver funil <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "#0F2044" }}>
            {hotDeals.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[#6B7280] text-center font-medium">
                Nenhum deal no funil ainda.{" "}
                <Link href="/funis" className="font-bold" style={{ color: "#84CC16" }}>Criar agora →</Link>
              </p>
            ) : (
              hotDeals.map((deal) => (
                <div key={deal.id} className="px-5 py-3 flex items-center gap-3">
                  <div
                    className="w-3 h-8 shrink-0"
                    style={{ background: deal.stage.color, border: "2px solid #0F2044" }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-[#0F2044] truncate">{deal.title}</p>
                    <p className="text-xs text-[#6B7280]">
                      {deal.stage.name}
                      {deal.contact ? ` · ${deal.contact.firstName} ${deal.contact.lastName}` : ""}
                    </p>
                  </div>
                  <span
                    className="text-xs font-black shrink-0 px-2 py-1"
                    style={{ background: "#0F2044", color: "#84CC16", border: "2px solid #0F2044" }}
                  >
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(deal.value)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
