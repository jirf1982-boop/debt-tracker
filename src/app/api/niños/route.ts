import { prisma } from '@/lib/prisma'
import { obtenerTodosNinos } from '@/lib/balance-nino'
import { TipoMovimientoNino } from '@/types'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const CreateNinoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  deuda_inicial: z.coerce.number().min(0, 'La deuda inicial debe ser mayor o igual a 0'),
})

const MovimientoNinoSchema = z.object({
  tipo: z.enum(['PAGO_PADRE', 'RETIRO_NINO', 'REGALO_DINERO'] as const),
  monto: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  fecha: z.string().datetime(),
  nota: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const ninos = await obtenerTodosNinos()
    return NextResponse.json(ninos)
  } catch (error) {
    console.error('Error fetching niños:', error)
    return NextResponse.json(
      { error: 'Error al obtener niños' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateNinoSchema.parse(body)

    const nino = await prisma.nino.create({
      data: {
        nombre: validatedData.nombre,
        deuda_inicial: validatedData.deuda_inicial.toString(),
      },
    })

    return NextResponse.json(nino, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating niño:', error)
    return NextResponse.json(
      { error: 'Error al crear niño' },
      { status: 500 }
    )
  }
}
