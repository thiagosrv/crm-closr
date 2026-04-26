import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDashboardMetrics } from "@/server/queries/visao-geral"
import { InsightsClient } from "@/components/insights/InsightsClient"

export default async function InsightsPage() {
  const session = await auth()

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session?.user?.id ?? "" },
        ...(session?.user?.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true, goal: true, goalPeriod: true },
  })

  const userId = dbUser?.id ?? session?.user?.id ?? ""

  const metrics = await getDashboardMetrics({ userId })

  // Deals por etapa para pie (only this user's stages and deals)
  const stages = await prisma.pipelineStage.findMany({ where: { userId }, orderBy: { order: "asc" } })
  const dealsPorEtapa = await Promise.all(
    stages.map(async (s) => {
      const count = await prisma.deal.count({ where: { stageId: s.id, status: "OPEN", assignedToId: userId } })
      const agg = await prisma.deal.aggregate({ where: { stageId: s.id, status: "OPEN", assignedToId: userId }, _sum: { value: true } })
      return { name: s.name, color: s.color, count, value: agg._sum.value ?? 0 }
    })
  )

  // Won/Lost count this month (scoped to this user)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const wonThisMonth = await prisma.deal.count({ where: { status: "WON", wonAt: { gte: monthStart }, assignedToId: userId } })
  const lostThisMonth = await prisma.deal.count({ where: { status: "LOST", lostAt: { gte: monthStart }, assignedToId: userId } })
  const newThisMonth = await prisma.deal.count({ where: { createdAt: { gte: monthStart }, assignedToId: userId } })

  return (
    <InsightsClient
      metrics={metrics}
      dealsPorEtapa={dealsPorEtapa}
      wonThisMonth={wonThisMonth}
      lostThisMonth={lostThisMonth}
      newThisMonth={newThisMonth}
      userGoal={dbUser?.goal ?? 0}
    />
  )
}
