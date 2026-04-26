import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Iniciando seed...")

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@closr.app" },
    update: {},
    create: {
      name: "Admin Closr",
      email: "admin@closr.app",
      password: await bcrypt.hash("admin", 12),
      role: "ADMIN",
      plano: "DIAMOND",
      goal: 50000,
    },
  })

  // Etapas do pipeline
  await Promise.all([
    prisma.pipelineStage.upsert({
      where: { id: "stage-lead" },
      update: {},
      create: {
        id: "stage-lead",
        name: "Lead",
        order: 0,
        probability: 10,
        color: "#64748B",
        rottingDays: 7,
      },
    }),
    prisma.pipelineStage.upsert({
      where: { id: "stage-qualificado" },
      update: {},
      create: {
        id: "stage-qualificado",
        name: "Qualificado",
        order: 1,
        probability: 30,
        color: "#06B6D4",
        rottingDays: 10,
      },
    }),
    prisma.pipelineStage.upsert({
      where: { id: "stage-proposta" },
      update: {},
      create: {
        id: "stage-proposta",
        name: "Proposta",
        order: 2,
        probability: 60,
        color: "#8B5CF6",
        rottingDays: 14,
      },
    }),
    prisma.pipelineStage.upsert({
      where: { id: "stage-negociacao" },
      update: {},
      create: {
        id: "stage-negociacao",
        name: "Negociação",
        order: 3,
        probability: 80,
        color: "#F59E0B",
        rottingDays: 14,
      },
    }),
    prisma.pipelineStage.upsert({
      where: { id: "stage-fechamento" },
      update: {},
      create: {
        id: "stage-fechamento",
        name: "Fechamento",
        order: 4,
        probability: 90,
        color: "#10B981",
        rottingDays: 7,
      },
    }),
  ])

  console.log("Seed concluido!")
  console.log("Login: admin@closr.app")
  console.log("Senha: admin")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
