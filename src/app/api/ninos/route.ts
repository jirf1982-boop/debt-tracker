import { NextResponse } from 'next/server'
import { obtenerTodosNinos } from '@/lib/balance-nino'
import { getSession } from '@/lib/auth'

export async function GET() {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const ninos = await obtenerTodosNinos()
    return NextResponse.json(ninos)
  } catch (error) {
    console.error('Error obteniendo ninos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
// Force redeploy
