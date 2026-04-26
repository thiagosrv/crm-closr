import { prisma } from "@/lib/prisma"

export interface DashboardFilters {
  userId: string          // required — all data is scoped per user
  startDate?: Date
  endDate?: Date
  rottingDays?: number
}

function defaultPeriod() {
  const end = new Date()
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export async function getDashboardMetrics(filters: DashboardFilters) {
  const { userId, rottingDays = 14 } = filters
  const { start, end } = filters.startDate && filters.endDate
    ? { start: filters.startDate, end: filters.endDate }
    : defaultPeriod()

  const userFilter = { assignedToId: userId }

  const wonDeals = await prisma.deal.findMany({
    where: { status: "WON", wonAt: { gte: start, lte: end }, ...userFilter },
    include: { assignedTo: { select: { id: true, name: true } } },
  })

  const openDeals = await prisma.deal.findMany({
    where: { status: "OPEN", ...userFilter },
    include: {
      stage: { select: { id: true, name: true, color: true } },
      assignedTo: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
    },
  })

  const allDealsInPeriod = await prisma.deal.findMany({
    where: { createdAt: { gte: start, lte: end }, ...userFilter },
    select: { status: true },
  })

  const receitaFechada = wonDeals.reduce((sum, d) => sum + d.value, 0)
  const valorPipeline = openDeals.reduce((sum, d) => sum + d.value, 0)
  const wonCount = allDealsInPeriod.filter(d => d.status === "WON").length
  const taxaConversao = allDealsInPeriod.length > 0
    ? (wonCount / allDealsInPeriod.length) * 100 : 0
  const ticketMedio = wonDeals.length > 0 ? receitaFechada / wonDeals.length : 0

  const cicloVendas = (() => {
    const withWonAt = wonDeals.filter(d => d.wonAt)
    if (!withWonAt.length) return 0
    const totalDays = withWonAt.reduce((sum, d) => {
      return sum + (d.wonAt!.getTime() - d.createdAt.getTime()) / 86400000
    }, 0)
    return totalDays / withWonAt.length
  })()

  // Receita por mês (last 6 months)
  const receitaPorMes: { mes: string; receita: number; projetado: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1); d.setHours(0, 0, 0, 0); d.setMonth(d.getMonth() - i)
    const monthStart = new Date(d)
    const monthEnd = new Date(d)
    monthEnd.setMonth(monthEnd.getMonth() + 1)
    monthEnd.setMilliseconds(-1)

    const monthWon = await prisma.deal.aggregate({
      where: { status: "WON", wonAt: { gte: monthStart, lte: monthEnd }, ...userFilter },
      _sum: { value: true },
    })
    const monthOpen = await prisma.deal.aggregate({
      where: { status: "OPEN", createdAt: { lte: monthEnd }, ...userFilter },
      _sum: { value: true },
    })

    receitaPorMes.push({
      mes: monthStart.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      receita: monthWon._sum.value ?? 0,
      projetado: (monthOpen._sum.value ?? 0) * ((taxaConversao || 20) / 100),
    })
  }

  // Deals por etapa (user's stages only)
  const stages = await prisma.pipelineStage.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  })
  const dealsPorEtapa = stages.map(stage => {
    const stageDeals = openDeals.filter(d => d.stageId === stage.id)
    return {
      stageName: stage.name,
      valor: stageDeals.reduce((sum, d) => sum + d.value, 0),
      count: stageDeals.length,
      color: stage.color,
    }
  })

  // Rotting deals
  const rottingThreshold = new Date()
  rottingThreshold.setDate(rottingThreshold.getDate() - rottingDays)
  const openDealIds = openDeals.map(d => d.id)
  const recentActivityDealIds = openDealIds.length
    ? (await prisma.activity.findMany({
        where: { dealId: { in: openDealIds }, createdAt: { gte: rottingThreshold } },
        select: { dealId: true },
        distinct: ["dealId"],
      })).map(a => a.dealId as string)
    : []

  return {
    receitaFechada,
    valorPipeline,
    totalPropostasAbertas: 0,
    taxaConversao,
    ticketMedio,
    cicloVendas,
    dealsWon: wonDeals.length,
    receitaPorMes,
    dealsPorEtapa,
    repRanking: [],
    dealsRotting: openDeals.filter(d => !recentActivityDealIds.includes(d.id)),
  }
}

export async function getPipelineStages(userId: string) {
  return prisma.pipelineStage.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  })
}
