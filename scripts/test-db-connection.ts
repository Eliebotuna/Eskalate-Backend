/**
 * Test de connexion à la base PostgreSQL.
 * Exécuter : npm run db:test
 * (Assure-toi d'avoir un fichier .env avec DATABASE_URL)
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT now() as now`;
    console.log("✅ Connexion réussie à PostgreSQL");
    console.log("   Heure serveur:", result[0].now);
  } catch (e) {
    console.error("❌ Erreur de connexion:", e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
