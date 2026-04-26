import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getContacts } from "@/server/queries/contacts"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
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

  const url = new URL(req.url)
  const search = url.searchParams.get("search") ?? undefined

  const contacts = await getContacts({ userId, search })
  return NextResponse.json(contacts)
}
