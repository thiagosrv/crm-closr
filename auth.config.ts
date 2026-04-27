import type { NextAuthConfig } from "next-auth"

/**
 * Auth config leve — sem dependências Node.js (pg, prisma).
 * Usado pelo middleware (Edge Runtime).
 * NÃO inclui providers com lógica server-side (Credentials/Google).
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [], // providers completos ficam em auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.plano = (user as { plano?: string }).plano
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session.user as { role?: unknown }).role = token.role
      ;(session.user as { plano?: unknown }).plano = token.plano
      return session
    },
  },
}
