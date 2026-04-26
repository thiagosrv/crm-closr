export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  if (!dbUser) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: dbUser.id }
  if (start && end) {
    where.dueAt = { gte: new Date(start), lte: new Date(end) }
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { dueAt: "asc" },
    select: {
      id: true,
      subject: true,
      type: true,
      dueAt: true,
      completedAt: true,
      contact: { select: { firstName: true, lastName: true } },
    },
  })

  return NextResponse.json(activities)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json()
  const { subject, type, dueAt, body: bodyText, contactId, dealId, leadId } = body

  if (!subject || !type) {
    return NextResponse.json({ error: "subject and type are required" }, { status: 400 })
  }

  const activity = await prisma.activity.create({
    data: {
      userId: dbUser.id,
      subject,
      type,
      body: bodyText,
      dueAt: dueAt ? new Date(dueAt) : null,
      contactId: contactId || null,
      dealId: dealId || null,
      leadId: leadId || null,
    },
  })

  return NextResponse.json(activity, { status: 201 })
}
