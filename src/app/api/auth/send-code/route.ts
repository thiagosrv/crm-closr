import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendVerificationCode } from "@/lib/email"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { email, name } = parsed.data

    // Verifica se e-mail já está cadastrado
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado. Faça login." }, { status: 409 })
    }

    // Invalida códigos anteriores do mesmo e-mail
    await prisma.emailVerification.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    // Gera código de 6 dígitos
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    await prisma.emailVerification.create({
      data: { email, code, name, expiresAt },
    })

    // Envia e-mail
    await sendVerificationCode(email, code, name)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[send-code] Error:", err)
    return NextResponse.json(
      { error: "Erro ao enviar código. Verifique se o e-mail está correto." },
      { status: 500 }
    )
  }
}
