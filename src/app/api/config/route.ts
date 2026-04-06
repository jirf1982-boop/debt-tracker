import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

const UpdateConfigSchema = z.object({
  balance_inicial: z.number().optional(),
  nombre_acreedor: z.string().min(1).max(100).optional(),
  moneda: z.enum(['MXN', 'USD']).optional(),
})

export async function GET() {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const config = await prisma.config.findFirst()
  if (!config) {
    return NextResponse.json({ error: 'Configuración no encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    id: config.id,
    balance_inicial: config.balance_inicial.toString(),
    nombre_acreedor: config.nombre_acreedor,
    moneda: config.moneda,
  })
}

export async function PUT(request: Request) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = UpdateConfigSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const config = await prisma.config.upsert({
      where: { id: 1 },
      update: {
        ...(parsed.data.balance_inicial !== undefined
          ? { balance_inicial: parsed.data.balance_inicial }
          : {}),
        ...(parsed.data.nombre_acreedor !== undefined
          ? { nombre_acreedor: parsed.data.nombre_acreedor }
          : {}),
        ...(parsed.data.moneda !== undefined ? { moneda: parsed.data.moneda } : {}),
      },
      create: {
        id: 1,
        balance_inicial: parsed.data.balance_inicial ?? 0,
        nombre_acreedor: parsed.data.nombre_acreedor ?? 'Acreedor',
        moneda: parsed.data.moneda ?? 'MXN',
      },
    })

    return NextResponse.json({
      id: config.id,
      balance_inicial: config.balance_inicial.toString(),
      nombre_acreedor: config.nombre_acreedor,
      moneda: config.moneda,
    })
  } catch (error) {
    console.error('Error actualizando config:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
