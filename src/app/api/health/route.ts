import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$connect()
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[health] DB Error:', error)
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
// Force redeploy Tue May 19 17:50:53 EDT 2026
