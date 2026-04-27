import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ClientesAtivosClient from "@/components/clientes-ativos/ClientesAtivosClient"

export default async function ClientesAtivosPage() {
  const session = await auth()

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session?.user?.id ?? "" },
        ...(session?.user?.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  })

  const userId = dbUser?.id ?? ""

  const [clientesRaw, meta] = await Promise.all([
    userId
      ? prisma.clienteAtivo.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        })
      : [],
    userId
      ? prisma.clienteAtivoMeta.findUnique({ where: { userId } })
      : null,
  ])

  // Serialize Date → string so client component can receive it as JSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientes = JSON.parse(JSON.stringify(clientesRaw)) as any[]

  return (
    <ClientesAtivosClient
      initialClientes={clientes}
      initialMeta={{
        metaMensal:      meta?.metaMensal      ?? 0,
        metaAnual:       meta?.metaAnual        ?? 0,
        percPublicidade: meta?.percPublicidade  ?? 10,
      }}
    />
  )
}
