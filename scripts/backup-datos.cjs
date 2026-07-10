// Respaldo completo de la base de datos a backups/backup-FECHA.json
// Uso: node scripts/backup-datos.cjs   (desde la raíz del proyecto)
const fs = require('fs')
const path = require('path')

// Cargar DATABASE_URL desde .env.local (Prisma CLI no lo lee solo)
const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)=["']?([^"'\n]+)["']?/)
  if (m) process.env[m[1]] = m[2]
}

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const [config, movimientos, ninos, movimientosNino] = await Promise.all([
    prisma.config.findMany(),
    prisma.movimiento.findMany({ orderBy: { id: 'asc' } }),
    prisma.nino.findMany({ orderBy: { id: 'asc' } }),
    prisma.movimientoNino.findMany({ orderBy: { id: 'asc' } }),
  ])
  const fecha = new Date().toISOString().slice(0, 10)
  const out = path.join(__dirname, '..', 'backups', `backup-${fecha}.json`)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(
    { exportado: new Date().toISOString(), config, movimientos, ninos, movimientosNino },
    null, 2
  ))
  console.log(`Respaldo OK: ${out}`)
  console.log(`  Config: ${config.length} | Movimientos: ${movimientos.length} | Niños: ${ninos.length} | Mov. niños: ${movimientosNino.length}`)
  console.log('Guarda una copia de este archivo fuera de tu Mac (Drive, email a ti misma, etc.)')
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
