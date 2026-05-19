require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('1. Testing Prisma client...')
    const allNinos = await prisma.nino.findMany()
    console.log('2. Found ninos:', allNinos.length)
    console.log('3. Ninos:', JSON.stringify(allNinos, null, 2))
    
    if (allNinos.length > 0) {
      console.log('4. Testing calcularBalance...')
      // Simulate what balance-nino.ts does
      for (const nino of allNinos) {
        const withMov = await prisma.nino.findUnique({
          where: { id: nino.id },
          include: { movimientos: true }
        })
        console.log(`5. ${nino.nombre} has ${withMov?.movimientos?.length || 0} movimientos`)
      }
    }
  } catch (error) {
    console.error('ERROR:', error.message)
    console.error('STACK:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

test()
