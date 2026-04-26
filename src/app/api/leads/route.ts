import { auth } from "@/auth"
import { getLeads, type LeadsFilters } from "@/server/queries/leads"
import { NextResponse } from "next/server"

const VALID_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED", "CONVERTED"] as const
type LeadStatus = (typeof VALID_STATUSES)[number]

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const rawStatus = url.searchParams.get("status")
  const filters: LeadsFilters = {
    search: url.searchParams.get("search") ?? undefined,
    status: VALID_STATUSES.includes(rawStatus as LeadStatus) ? (rawStatus as LeadStatus) : undefined,
  }

  const leads = await getLeads(filters)
  return NextResponse.json(leads)
}
