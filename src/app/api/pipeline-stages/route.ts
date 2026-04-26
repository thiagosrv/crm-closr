import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getPipelineStages } from "@/server/queries/visao-geral"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  const userId = dbUser?.id ?? session.user.id ?? ""

  const stages = await getPipelineStages(userId)
  return NextResponse.json(stages)
}
