import type { NextAuthConfig } from "next-auth"

/**
 * Auth config leve — sem dependências Node.js (pg, prisma).
 * Usado pelo middleware (Edge Runtime).
 */
export const authConfig: NextAuthConfig = {
  trustHost: true, // necessário para Railway/Vercel/domínios de produção
  pages: { signIn: "/login" },
  providers: [], // providers completos ficam em auth.ts
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // Ao fazer login: copia campos do user para o token
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
        token.plano = (user as { plano?: string }).plano
        token.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted ?? false
      }
      // Ao chamar update() no client: mescla dados novos ao token
      if (trigger === "update" && session) {
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session.user as { role?: unknown }).role = token.role
      ;(session.user as { plano?: unknown }).plano = token.plano
      ;(session.user as { onboardingCompleted?: boolean }).onboardingCompleted =
        token.onboardingCompleted as boolean | undefined
      return session
    },
  },
}
