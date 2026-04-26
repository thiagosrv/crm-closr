import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Closr — CRM Inteligente",
  description: "Gerencie seu pipeline comercial com eficiência",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ overscrollBehavior: "none", background: "#F4F4F4" }}>
      <body
        className={inter.className}
        suppressHydrationWarning
        style={{ overscrollBehavior: "none", minHeight: "100dvh" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
