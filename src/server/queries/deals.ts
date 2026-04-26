import { prisma } from "@/lib/prisma"

const dealIncludeBase = {
  stage: true,
  contact: true,
  assignedTo: {
    select: { id: true, name: true, email: true, image: true },
  },
} as const

export async function getDealsForKanban(userId: string) {
  const deals = await prisma.deal.findMany({
    where: { status: "OPEN", assignedToId: userId },
    include: {
      ...dealIncludeBase,
      _count: { select: { activities: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Group by stageId
  const grouped: Record<string, typeof deals> = {}
  for (const deal of deals) {
    if (!grouped[deal.stageId]) grouped[deal.stageId] = []
    grouped[deal.stageId].push(deal)
  }

  return grouped
}

export async function getDealById(id: string) {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      stage: true,
      contact: true,
      assignedTo: {
        select: { id: true, name: true, email: true, image: true },
      },
      activities: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      proposals: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export interface DealsTableFilters {
  search?: string
  status?: "OPEN" | "WON" | "LOST"
  stageId?: string
  assignedToId?: string
  page?: number
  pageSize?: number
}

export async function getDealsTable(filters: DealsTableFilters = {}) {
  const { search, status, stageId, assignedToId, page = 1, pageSize = 20 } = filters

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  if (status) where.status = status
  if (stageId) where.stageId = stageId
  if (assignedToId) where.assignedToId = assignedToId
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { contact: { firstName: { contains: search } } },
      { contact: { lastName: { contains: search } } },
      { contact: { company: { contains: search } } },
    ]
  }

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: dealIncludeBase,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.deal.count({ where }),
  ])

  return { deals, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
