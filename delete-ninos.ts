import { prisma } from '@/lib/db'

async function cleanup() {
  console.log('Deleting all ninos...')
  const deleted = await prisma.movimientoNino.deleteMany({})
  console.log('Deleted movimientos:', deleted.count)

  const ninosDeleted = await prisma.nino.deleteMany({})
  console.log('Deleted ninos:', ninosDeleted.count)

  console.log('Done!')
}

cleanup().catch(console.error)
