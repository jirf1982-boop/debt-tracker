import { prisma } from '@/lib/prisma'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { NextRequest, NextResponse } from 'next/server'

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

    const balance = await calcularBalanceNino(ninoId)
    return NextResponse.json(balance)
  } catch (error) {
    console.error('Error fetching child balance:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del niño' },
      { status: 500 }
    )
  }
}
