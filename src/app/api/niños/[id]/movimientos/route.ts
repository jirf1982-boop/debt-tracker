import { prisma } from '@/lib/db'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const MovimientoNinoSchema = z.object({
  tipo: z.enum(['PAGO_PADRE', 'RETIRO_NINO', 'REGALO_DINERO'] as const),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  fecha: z.string().datetime(),
  nota: z.string().optional().nullable(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const ninoId = parseInt(id)

    if (isNaN(ninoId)) {
      return NextResponse.json(
        { error: 'Invalid child ID' },
        { status: 400 }
      )
    }

    const movimientos = await prisma.movimientoNino.findMany({
      where: { ninoId },
      orderBy: { fecha: 'desc' },
    })

    return NextResponse.json(movimientos)
  } catch (error) {
    console.error('Error fetching movimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const ninoId = parseInt(id)

    if (isNaN(ninoId)) {
      return NextResponse.json(
        { error: 'Invalid child ID' },
        { status: 400 }
      )
    }

    // Verify child exists
    const nino = await prisma.nino.findUnique({
      where: { id: ninoId },
    })

    if (!nino) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = MovimientoNinoSchema.parse(body)

    const movimiento = await prisma.movimientoNino.create({
      data: {
        ninoId,
        tipo: validatedData.tipo,
        monto: validatedData.monto.toString(),
        fecha: new Date(validatedData.fecha),
        nota: validatedData.nota || null,
      },
    })

    // Return updated balance
    const updatedBalance = await calcularBalanceNino(ninoId)

    return NextResponse.json(
      { movimiento, balance: updatedBalance },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating movimiento:', error)
    return NextResponse.json(
      { error: 'Error al crear movimiento' },
      { status: 500 }
    )
  }
}
