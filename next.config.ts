import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@whiskeysockets/baileys",
    "@hapi/boom",
    "sharp",
    "jimp",
    "qrcode",
    "node-cache",
    "pino",
    "pino-pretty",
    "pg",
    "pg-native",
    "@prisma/adapter-pg",
    "better-sqlite3",
  ],
};

export default nextConfig;
