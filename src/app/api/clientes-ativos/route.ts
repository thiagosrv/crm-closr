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

// GET — list all clientes ativos for the current user
export async function GET() {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clientes = await prisma.clienteAtivo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clientes)
}

// POST — create a new cliente ativo
export async function POST(req: NextRequest) {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json() as Record<string, unknown>

  const cliente = await prisma.clienteAtivo.create({
    data: {
      userId,
      empresa:      String(body.empresa      ?? ""),
      contato:      body.contato      ? String(body.contato)      : null,
      email:        body.email        ? String(body.email)        : null,
      telefone:     body.telefone     ? String(body.telefone)     : null,
      segmento:     body.segmento     ? String(body.segmento)     : null,
      valorNota:    Number(body.valorNota)    || 0,
      valorLiquido: Number(body.valorLiquido) || 0,
      impostos:     Number(body.impostos)     || 0,
      comissoes:    Number(body.comissoes)    || 0,
      custosExtras: Number(body.custosExtras) || 0,
      custosFixos:  Number(body.custosFixos)  || 0,
      numeroPostos: Number(body.numeroPostos) || 1,
      metaMensal:   Number(body.metaMensal)   || 0,
      metaAnual:    Number(body.metaAnual)    || 0,
      status:       String(body.status       ?? "ATIVO"),
      observacoes:  body.observacoes  ? String(body.observacoes)  : null,
    },
  })

  return NextResponse.json(cliente, { status: 201 })
}
