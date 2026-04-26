export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const conversationId = url.searchParams.get("conversationId")

  const where = conversationId
    ? { userId: session.user.id, conversationId }
    : { userId: session.user.id }

  const followUps = await prisma.followUpSchedule.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
  })
  return Response.json(followUps)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { conversationId, leadId, message, scheduledAt } = await req.json() as {
    conversationId: string
    leadId?: string
    message: string
    scheduledAt: string
  }

  if (!conversationId || !message?.trim() || !scheduledAt) {
    return Response.json({ error: "Invalid payload" }, { status: 400 })
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { channelSession: { select: { userId: true } } },
  })
  if (!conv || conv.channelSession.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true } })

  const fu = await prisma.followUpSchedule.create({
    data: {
      userId: dbUser!.id,
      conversationId,
      leadId: leadId ?? conv.leadId ?? null,
      message: message.trim(),
      scheduledAt: new Date(scheduledAt),
      status: "PENDING",
    },
  })
  return Response.json(fu)
}
