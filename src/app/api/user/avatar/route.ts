export const runtime = "nodejs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
  const { image } = body

  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "image is required" }, { status: 400 })
  }

  // Limit base64 size (~2MB → ~2.7MB base64)
  if (image.length > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 })
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { image },
  })

  return NextResponse.json({ success: true })
}
