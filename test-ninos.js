require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
    console.log('Testing database connection...')

    const ninos = await prisma.nino.findMany({
      orderBy: { nombre: 'asc' },
    })

    console.log('Found ninos:', ninos)

    if (ninos.length > 0) {
      const firstNino = ninos[0]
      console.log(`\nGetting movimientos for ${firstNino.nombre}...`)

      const withMovimientos = await prisma.nino.findUnique({
        where: { id: firstNino.id },
        include: { movimientos: true },
      })

      console.log('First nino with movimientos:', withMovimientos)
    }
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

test()
