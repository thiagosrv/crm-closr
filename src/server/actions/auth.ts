"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
})

export async function registerUser(data: unknown) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) return { error: "Dados inválidos" }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return { error: "E-mail já cadastrado" }

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      role: "REP",
      plano: "FREE",
    },
  })
  return { success: true }
}
