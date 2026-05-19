import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
      env: {
        database: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
        nodeEnv: process.env.NODE_ENV,
      },
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
