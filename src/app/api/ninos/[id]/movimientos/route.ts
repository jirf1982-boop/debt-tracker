import { prisma } from '@/lib/db'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { NextResponse } from 'next/server'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ninoId = parseInt(id, 10)

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
  try {
    const { id } = await params
    const ninoId = parseInt(id, 10)
    const { tipo, monto, fecha, nota } = await request.json()

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
      data: {
        ninoId,
        tipo,
        monto: new Decimal(monto),
        fecha: new Date(fecha),
        nota: nota || null,
      },
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
