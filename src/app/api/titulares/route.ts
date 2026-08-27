import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { obtenerTodosTitulares } from '@/lib/balance-titular'

const CrearTitularSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(60, 'Máximo 60 caracteres'),
  monto_inicial: z.number().nonnegative('El monto inicial no puede ser negativo'),
})

export async function GET() {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const balances = await obtenerTodosTitulares()
    return NextResponse.json(balances)
  } catch (error) {
    console.error('[GET /api/titulares]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = CrearTitularSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const titular = await prisma.titular.create({
      data: {
        nombre: parsed.data.nombre,
        monto_inicial: parsed.data.monto_inicial,
      },
    })

    return NextResponse.json(
      {
        id: titular.id,
        nombre: titular.nombre,
        monto_inicial: titular.monto_inicial.toString(),
        created_at: titular.created_at.toISOString(),
        updated_at: titular.updated_at.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/titulares]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
