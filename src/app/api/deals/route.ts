import { auth } from "@/auth"
import { getDealsTable, type DealsTableFilters } from "@/server/queries/deals"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const rawStatus = url.searchParams.get("status")
  const filters: DealsTableFilters = {
    search: url.searchParams.get("search") ?? undefined,
    status: (rawStatus === "OPEN" || rawStatus === "WON" || rawStatus === "LOST") ? rawStatus : undefined,
    stageId: url.searchParams.get("stageId") ?? undefined,
  }

  const deals = await getDealsTable(filters)
  return NextResponse.json(deals)
}
