export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendTextMessage } from "@/lib/channels/whatsapp-cloud"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ id: session.user.id }, ...(session.user.email ? [{ email: session.user.email }] : [])] },
    select: { id: true },
  })
  if (!dbUser) return Response.json({ error: "User not found" }, { status: 401 })

  const body = await req.json() as { conversationId: string; message?: string; content?: string }
  const text = (body.message ?? body.content ?? "").trim()
  if (!body.conversationId || !text) {
    return Response.json({ error: "Invalid payload" }, { status: 400 })
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: body.conversationId },
    select: { externalId: true, channelSession: { select: { userId: true } } },
  })
  if (!conversation) {
    return Response.json({ error: "Conversation not found" }, { status: 404 })
  }

  // Send via Meta Cloud API
  await sendTextMessage(conversation.externalId, text)

  const msg = await prisma.message.create({
    data: {
      conversationId: body.conversationId,
      direction: "OUTBOUND",
      type: "TEXT",
      content: text,
      isRead: true,
    },
  })

  await prisma.conversation.update({
    where: { id: body.conversationId },
    data: { lastMessageAt: new Date() },
  })

  return Response.json(msg)
}
