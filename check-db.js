require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function check() {
  const ninos = await prisma.nino.findMany()
  console.log('Found ninos:', ninos)
  await prisma.$disconnect()
}

check()
