import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  // process.env retorna undefined sem lançar erro (seguro para prisma generate).
  // A URL real é necessária apenas para prisma migrate / conexão em runtime.
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
  },
})
