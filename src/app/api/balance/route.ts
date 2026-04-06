import { NextResponse } from 'next/server'
import { calcularBalance } from '@/lib/balance'
import { getSession } from '@/lib/auth'

export async function GET() {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const balance = await calcularBalance()
    return NextResponse.json(balance)
  } catch (error) {
    console.error('Error calculando balance:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
