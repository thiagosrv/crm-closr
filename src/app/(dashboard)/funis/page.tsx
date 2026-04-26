import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDealsForKanban } from "@/server/queries/deals"
import { getPipelineStages } from "@/server/queries/visao-geral"
import { KanbanBoard } from "@/components/pipeline/KanbanBoard"
import { seedDefaultStages } from "@/server/actions/users"

export default async function FunisPage() {
  const session = await auth()

  // Resolve real DB user id
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session?.user?.id ?? "" },
        ...(session?.user?.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })

  const userId = dbUser?.id ?? session?.user?.id ?? ""

  // Ensure default stages exist for this user
  await seedDefaultStages(userId)

  const [stages, dealsByStage, contacts] = await Promise.all([
    getPipelineStages(userId),
    getDealsForKanban(userId),
    prisma.contact.findMany({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        whatsapp: true,
        email: true,
        company: true,
      },
      orderBy: { firstName: "asc" },
    }),
  ])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white shrink-0"
        style={{ borderBottom: "2px solid #0F2044" }}
      >
        <div>
          <h1 className="brutal-heading text-xl sm:text-2xl">Funis de Venda</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] font-medium mt-0.5 hidden sm:block">
            Arraste os cards entre as etapas para avançar no funil
          </p>
        </div>
        <div
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest shrink-0"
          style={{ background: "#84CC16", border: "2px solid #0F2044" }}
        >
          {stages.length} etapas
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-[#F4F4F4] px-2 sm:px-4 pt-3 sm:pt-4">
        <KanbanBoard stages={stages} dealsByStage={dealsByStage} contacts={contacts} />
      </div>
    </div>
  )
}
