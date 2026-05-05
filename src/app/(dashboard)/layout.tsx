import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DashboardShell } from "@/components/layout/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Checa onboardingCompleted direto no banco — mais confiável que sessão/JWT
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id ?? "" },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { onboardingCompleted: true },
  })

  if (!dbUser?.onboardingCompleted) {
    redirect("/onboarding")
  }

  return <DashboardShell>{children}</DashboardShell>
}
