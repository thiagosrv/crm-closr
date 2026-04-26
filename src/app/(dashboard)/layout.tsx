import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardShell } from "@/components/layout/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!session.user?.onboardingCompleted) {
    redirect("/onboarding")
  }

  return <DashboardShell>{children}</DashboardShell>
}
