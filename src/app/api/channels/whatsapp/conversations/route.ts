export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ id: session.user.id }, ...(session.user.email ? [{ email: session.user.email }] : [])] },
    select: { id: true },
  })
  if (!dbUser) return Response.json([])

  const conversations = await prisma.conversation.findMany({
    where: { channelSession: { userId: dbUser.id, channel: "WHATSAPP" } },
    include: {
      labels: true,
      contact: { select: { id: true, firstName: true, lastName: true } },
      lead: { select: { id: true, title: true } },
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
        select: { content: true, direction: true, sentAt: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  })

  return Response.json(conversations)
}
