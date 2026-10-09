import { prisma } from '@/lib/db'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'

const CrearMovimientoNinoSchema = z.object({
  tipo: z.enum(['PAGO_PADRE', 'RETIRO_NINO', 'REGALO_DINERO']),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.coerce.date(),
  nota: z.string().max(200, 'La nota no puede superar 200 caracteres').nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const ninoId = parseInt(id, 10)

    if (isNaN(ninoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const movimientos = await prisma.movimientoNino.findMany({
      where: { ninoId },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json(movimientos)
  } catch (error) {
    console.error('[GET /api/ninos/[id]/movimientos]', error)
    return NextResponse.json(
      { error: 'Error fetching movimientos' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const ninoId = parseInt(id, 10)

    if (isNaN(ninoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const parsed = CrearMovimientoNinoSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { tipo, monto, fecha, nota } = parsed.data

    // Verify the nino exists
    const nino = await prisma.nino.findUnique({
      where: { id: ninoId },
    })

    if (!nino) {
      return NextResponse.json(
        { error: 'Nino not found' },
        { status: 404 }
      )
    }

    // Create the movement
    const movimiento = await prisma.movimientoNino.create({
      data: { ninoId, tipo, monto, fecha, nota: nota ?? null },
    })

    // Recalculate balance
    const balance = await calcularBalanceNino(ninoId)

    return NextResponse.json({ success: true, movimiento, balance })
  } catch (error) {
    console.error('[POST /api/ninos/[id]/movimientos]', error)
    return NextResponse.json(
      { error: 'Error creating movimiento' },
      { status: 500 }
    )
  }
}
