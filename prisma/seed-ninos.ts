import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const lucas = await prisma.nino.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombre: 'Lucas',
      deuda_inicial: '1270.00',
    },
  })
  
  const nicole = await prisma.nino.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nombre: 'Nicole',
      deuda_inicial: '940.00',
    },
  })
  
  console.log('Created:', { lucas, nicole })
}

main().catch(console.error).finally(() => prisma.$disconnect())
