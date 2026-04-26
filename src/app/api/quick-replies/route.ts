export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const replies = await prisma.quickReply.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(replies)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { title, type, content } = await req.json() as { title: string; type?: string; content: string }
  const reply = await prisma.quickReply.create({
    data: { userId: session.user.id, title, type: type ?? "TEXT", content },
  })
  return Response.json(reply)
}
