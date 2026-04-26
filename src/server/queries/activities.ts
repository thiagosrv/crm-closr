import { prisma } from "@/lib/prisma"

export interface ActivitiesFilters {
  userId?: string
  contactId?: string
  dealId?: string
  leadId?: string
  type?: string
  completed?: boolean
  page?: number
  pageSize?: number
}

export async function getActivities(filters: ActivitiesFilters = {}) {
  const { userId, contactId, dealId, leadId, type, completed, page = 1, pageSize = 20 } = filters

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {}

  if (userId) where.userId = userId
  if (contactId) where.contactId = contactId
  if (dealId) where.dealId = dealId
  if (leadId) where.leadId = leadId
  if (type) where.type = type
  if (completed === true) where.completedAt = { not: null }
  if (completed === false) where.completedAt = null

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        deal: { select: { id: true, title: true, value: true } },
        lead: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activity.count({ where }),
  ])

  return { activities, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getPendingActivities(userId: string) {
  const now = new Date()

  return prisma.activity.findMany({
    where: {
      userId,
      completedAt: null,
      dueAt: { gte: now },
    },
    include: {
      contact: { select: { id: true, firstName: true, lastName: true, company: true } },
      deal: { select: { id: true, title: true } },
      lead: { select: { id: true, title: true } },
    },
    orderBy: { dueAt: "asc" },
  })
}
