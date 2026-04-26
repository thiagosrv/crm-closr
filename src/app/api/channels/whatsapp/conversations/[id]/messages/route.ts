export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { channelSession: { select: { userId: true } } },
  })
  if (!conv || conv.channelSession.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.message.updateMany({
    where: { conversationId: id, direction: "INBOUND", isRead: false },
    data: { isRead: true },
  })
  await prisma.conversation.update({
    where: { id },
    data: { unreadCount: 0 },
  })

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { sentAt: "asc" },
  })

  return Response.json(messages)
}
