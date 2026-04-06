import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

const TipoMovimientoSchema = z.enum([
  'RETIRO_PERSONAL',
  'RETIRO_NEGOCIO',
  'ABONO_PERSONAL',
  'ABONO_NEGOCIO',
  'FEE_BANCARIO',
  'ABONO_INTERES',
  'RETIRO_DUENO',
  'CREDITO_DUENO',
])

const CrearMovimientoSchema = z.object({
  tipo: TipoMovimientoSchema,
  monto: z.number().positive('El monto debe ser positivo'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida — use YYYY-MM-DD'),
  nota: z.string().max(200, 'La nota no puede superar 200 caracteres').optional(),
})

export async function GET(request: Request) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))

  const where: Record<string, unknown> = {}

  if (tipo && TipoMovimientoSchema.safeParse(tipo).success) {
    where.tipo = tipo
  }

  if (desde || hasta) {
    where.fecha = {
      ...(desde ? { gte: new Date(desde) } : {}),
      ...(hasta ? { lte: new Date(`${hasta}T23:59:59`) } : {}),
    }
  }

  const [data, total] = await Promise.all([
    prisma.movimiento.findMany({
      where,
      orderBy: [{ fecha: 'desc' }, { created_at: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.movimiento.count({ where }),
  ])

  return NextResponse.json({
    data: data.map((m) => ({
      id: m.id,
      tipo: m.tipo,
      monto: m.monto.toString(),
      fecha: m.fecha.toISOString(),
      nota: m.nota,
      created_at: m.created_at.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = CrearMovimientoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { tipo, monto, fecha, nota } = parsed.data

    const movimiento = await prisma.movimiento.create({
      data: {
        tipo,
        monto,
        fecha: new Date(`${fecha}T12:00:00`),
        nota: nota ?? null,
      },
    })

    return NextResponse.json(
      {
        id: movimiento.id,
        tipo: movimiento.tipo,
        monto: movimiento.monto.toString(),
        fecha: movimiento.fecha.toISOString(),
        nota: movimiento.nota,
        created_at: movimiento.created_at.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creando movimiento:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
