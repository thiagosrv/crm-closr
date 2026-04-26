import { prisma } from "@/lib/prisma"

export interface TeamMemberMetrics {
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    goal: number
    goalPeriod: string
  }
  dealsWon: number
  receitaFechada: number
  metaProgress: number
  activitiesCount: number
}

export async function getTeamMetrics(): Promise<TeamMemberMetrics[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      goal: true,
      goalPeriod: true,
    },
    orderBy: { name: "asc" },
  })

  const metrics = await Promise.all(
    users.map(async (user) => {
      const [wonDeals, activitiesCount] = await Promise.all([
        prisma.deal.findMany({
          where: { assignedToId: user.id, status: "WON" },
          select: { value: true },
        }),
        prisma.activity.count({ where: { userId: user.id } }),
      ])

      const receitaFechada = wonDeals.reduce((sum, d) => sum + d.value, 0)
      const dealsWon = wonDeals.length
      const metaProgress = user.goal > 0 ? (receitaFechada / user.goal) * 100 : 0

      return {
        user,
        dealsWon,
        receitaFechada,
        metaProgress,
        activitiesCount,
      }
    })
  )

  return metrics.sort((a, b) => b.receitaFechada - a.receitaFechada)
}
