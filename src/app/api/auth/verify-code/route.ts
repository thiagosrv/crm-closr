import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(6),
  name: z.string().min(2),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { email, code, password, name } = parsed.data

    // Busca o código mais recente não usado para este e-mail
    const verification = await prisma.emailVerification.findFirst({
      where: { email, code, used: false },
      orderBy: { createdAt: "desc" },
    })

    if (!verification) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "Código expirado. Solicite um novo." }, { status: 400 })
    }

    // Verifica se e-mail já foi cadastrado (concorrência)
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado. Faça login." }, { status: 409 })
    }

    // Marca código como usado
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    })

    // Cria o usuário
    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "REP",
        plano: "FREE",
        onboardingCompleted: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[verify-code] Error:", err)
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 })
  }
}
