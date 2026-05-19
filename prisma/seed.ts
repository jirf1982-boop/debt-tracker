import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create children
  const lucas = await prisma.nino.create({
    data: {
      nombre: 'Lucas',
      deuda_inicial: '1270',
    },
  })

  const nicole = await prisma.nino.create({
    data: {
      nombre: 'Nicole',
      deuda_inicial: '940',
    },
  })

  console.log('Children created:', { lucas, nicole })

  // Add test movements for Lucas
  await prisma.movimientoNino.create({
    data: {
      ninoId: lucas.id,
      tipo: 'PAGO_PADRE',
      monto: '100',
      fecha: new Date('2026-05-10'),
      nota: 'Pago semanal',
    },
  })

  await prisma.movimientoNino.create({
    data: {
      ninoId: lucas.id,
      tipo: 'RETIRO_NINO',
      monto: '50',
      fecha: new Date('2026-05-15'),
      nota: 'Retiro para compras',
    },
  })

  // Add test movements for Nicole
  await prisma.movimientoNino.create({
    data: {
      ninoId: nicole.id,
      tipo: 'PAGO_PADRE',
      monto: '75',
      fecha: new Date('2026-05-12'),
      nota: 'Primer pago',
    },
  })

  console.log('Test data created successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
