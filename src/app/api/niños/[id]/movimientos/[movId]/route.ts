import { prisma } from '@/lib/db'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string; movId: string }>
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id, movId } = await context.params
    const ninoId = parseInt(id)
    const movimientoId = parseInt(movId)

    if (isNaN(ninoId) || isNaN(movimientoId)) {
      return NextResponse.json(
        { error: 'Invalid IDs' },
        { status: 400 }
      )
    }

    // Verify movimiento belongs to child
    const movimiento = await prisma.movimientoNino.findUnique({
      where: { id: movimientoId },
    })

    if (!movimiento || movimiento.ninoId !== ninoId) {
      return NextResponse.json(
        { error: 'Movimiento not found' },
        { status: 404 }
      )
    }

    await prisma.movimientoNino.delete({
      where: { id: movimientoId },
    })

    // Return updated balance
    const updatedBalance = await calcularBalanceNino(ninoId)

    return NextResponse.json({ balance: updatedBalance })
  } catch (error) {
    console.error('Error deleting movimiento:', error)
    return NextResponse.json(
      { error: 'Error al eliminar movimiento' },
      { status: 500 }
    )
  }
}
