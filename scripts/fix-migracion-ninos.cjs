// Marca la migración de niños como aplicada (equivale a `prisma migrate
// resolve --applied`) usando el puerto 6543 que sí responde.
// Uso: node scripts/fix-migracion-ninos.cjs
const fs = require('fs')
const path = require('path')

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)=["']?([^"'\n]+)["']?/)
  if (m) process.env[m[1]] = m[2]
}

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.$executeRawUnsafe(`
    UPDATE _prisma_migrations
    SET finished_at = now(), logs = NULL, rolled_back_at = NULL, applied_steps_count = 1
    WHERE migration_name = '20260519114515_add_ninos_tables' AND finished_at IS NULL
  `)
  console.log(updated === 1 ? 'Migración de niños marcada como aplicada.' : 'Nada que corregir (ya estaba aplicada).')
  const rows = await prisma.$queryRawUnsafe(`
    SELECT migration_name,
           CASE WHEN finished_at IS NOT NULL AND rolled_back_at IS NULL THEN 'APLICADA' ELSE 'PROBLEMA' END AS estado
    FROM _prisma_migrations ORDER BY started_at
  `)
  console.log('\nEstado del historial de migraciones:')
  for (const r of rows) console.log(`  ${r.estado}  ${r.migration_name}`)
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
