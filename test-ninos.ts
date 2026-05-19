import { prisma } from '@/lib/db'

async function test() {
  try {
    console.log('Testing database connection...')

    const ninos = await prisma.nino.findMany({
      orderBy: { nombre: 'asc' },
    })

    console.log('Found ninos:', ninos.length)
    console.log('Ninos:', JSON.stringify(ninos, null, 2))

    if (ninos.length > 0) {
      const firstNino = ninos[0]
      console.log(`\nGetting movimientos for ${firstNino.nombre}...`)

      const withMovimientos = await prisma.nino.findUnique({
        where: { id: firstNino.id },
        include: { movimientos: true },
      })

      console.log('First nino with movimientos:', JSON.stringify(withMovimientos, null, 2))
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error))
  }
}

test()
