import { obtenerTodosNinos } from '@/lib/balance-nino'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('[debug/ninos] Starting query...')
    const ninos = await obtenerTodosNinos()
    console.log('[debug/ninos] Success:', ninos)
    return NextResponse.json({ success: true, ninos })
  } catch (error) {
    console.error('[debug/ninos] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
