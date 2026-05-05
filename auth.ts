import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Google só é incluído se as credenciais estiverem configuradas
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const googleProvider =
  googleClientId && googleClientSecret
    ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
    : []

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...googleProvider,
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
        if (!user?.password) return null
        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plano: user.plano,
          onboardingCompleted: user.onboardingCompleted,
        } as never
      },
    }),
  ],
})
