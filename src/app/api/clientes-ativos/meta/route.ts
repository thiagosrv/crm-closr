import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function getDbUserId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user) return null
  const db = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  return db?.id ?? null
}

export async function GET() {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const meta = await prisma.clienteAtivoMeta.findUnique({ where: { userId } })
  return NextResponse.json(meta ?? { metaMensal: 0, metaAnual: 0, percPublicidade: 10 })
}

export async function POST(req: NextRequest) {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json() as Record<string, unknown>

  const meta = await prisma.clienteAtivoMeta.upsert({
    where: { userId },
    create: {
      userId,
      metaMensal:      Number(body.metaMensal)      || 0,
      metaAnual:       Number(body.metaAnual)        || 0,
      percPublicidade: Number(body.percPublicidade)  || 10,
    },
    update: {
      metaMensal:      Number(body.metaMensal)      || 0,
      metaAnual:       Number(body.metaAnual)        || 0,
      percPublicidade: Number(body.percPublicidade)  || 10,
    },
  })

  return NextResponse.json(meta)
}
