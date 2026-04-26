export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { label, color } = await req.json() as { label: string; color?: string }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { channelSession: { select: { userId: true } } },
  })
  if (!conv || conv.channelSession.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const created = await prisma.conversationLabel.create({
    data: { conversationId: id, label, color: color ?? "#06B6D4" },
  })
  return Response.json(created)
}
