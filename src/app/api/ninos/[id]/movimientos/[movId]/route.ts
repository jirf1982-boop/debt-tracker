import { prisma } from '@/lib/db'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; movId: string }> }
) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id, movId } = await params
    const ninoId = parseInt(id, 10)
    const movimientoId = parseInt(movId, 10)

    if (isNaN(ninoId) || isNaN(movimientoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verify the movement exists and belongs to this nino
    const movimiento = await prisma.movimientoNino.findUnique({
      where: { id: movimientoId },
    })

    if (!movimiento || movimiento.ninoId !== ninoId) {
      return NextResponse.json(
        { error: 'Movimiento not found' },
        { status: 404 }
      )
    }

    // Delete the movement
    await prisma.movimientoNino.delete({
      where: { id: movimientoId },
    })

    // Recalculate balance
    const balance = await calcularBalanceNino(ninoId)

    return NextResponse.json({ success: true, balance })
  } catch (error) {
    console.error('[DELETE /api/ninos/[id]/movimientos/[movId]]', error)
    return NextResponse.json(
      { error: 'Error deleting movimiento' },
      { status: 500 }
    )
  }
}
