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

// PATCH — update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json() as Record<string, unknown>

  const existing = await prisma.clienteAtivo.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.clienteAtivo.update({
    where: { id },
    data: {
      empresa:      body.empresa      !== undefined ? String(body.empresa)                  : existing.empresa,
      contato:      body.contato      !== undefined ? (body.contato ? String(body.contato)  : null) : existing.contato,
      email:        body.email        !== undefined ? (body.email   ? String(body.email)    : null) : existing.email,
      telefone:     body.telefone     !== undefined ? (body.telefone ? String(body.telefone): null) : existing.telefone,
      segmento:     body.segmento     !== undefined ? (body.segmento ? String(body.segmento): null) : existing.segmento,
      valorNota:    body.valorNota    !== undefined ? Number(body.valorNota)    : existing.valorNota,
      valorLiquido: body.valorLiquido !== undefined ? Number(body.valorLiquido) : existing.valorLiquido,
      impostos:     body.impostos     !== undefined ? Number(body.impostos)     : existing.impostos,
      comissoes:    body.comissoes    !== undefined ? Number(body.comissoes)    : existing.comissoes,
      custosExtras: body.custosExtras !== undefined ? Number(body.custosExtras) : existing.custosExtras,
      custosFixos:  body.custosFixos  !== undefined ? Number(body.custosFixos)  : existing.custosFixos,
      numeroPostos: body.numeroPostos !== undefined ? Number(body.numeroPostos) : existing.numeroPostos,
      metaMensal:   body.metaMensal   !== undefined ? Number(body.metaMensal)   : existing.metaMensal,
      metaAnual:    body.metaAnual    !== undefined ? Number(body.metaAnual)    : existing.metaAnual,
      status:       body.status       !== undefined ? String(body.status)       : existing.status,
      observacoes:  body.observacoes  !== undefined ? (body.observacoes ? String(body.observacoes) : null) : existing.observacoes,
    },
  })

  return NextResponse.json(updated)
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getDbUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const existing = await prisma.clienteAtivo.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.clienteAtivo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
