import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { resolverTitular } from '@/lib/movimiento-edicion'
import { TIPOS_MOVIMIENTO } from '@/types'

const TipoMovimientoSchema = z.enum(TIPOS_MOVIMIENTO)

const EditarMovimientoSchema = z
  .object({
    tipo: TipoMovimientoSchema.optional(),
    monto: z.number().positive('El monto debe ser positivo').optional(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida — use YYYY-MM-DD').optional(),
    nota: z.string().max(200, 'La nota no puede superar 200 caracteres').nullable().optional(),
    titularId: z.number().int().positive().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No hay nada que cambiar' })

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const numId = parseInt(id, 10)

  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const parsed = EditarMovimientoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const actual = await prisma.movimiento.findUnique({ where: { id: numId } })
    if (!actual) {
      return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
    }

    const { tipo, monto, fecha, nota } = parsed.data

    const titularFinal = resolverTitular(actual, parsed.data)

    if (titularFinal !== undefined && titularFinal !== null) {
      const existe = await prisma.titular.findUnique({ where: { id: titularFinal } })
      if (!existe) {
        return NextResponse.json({ error: 'Titular no encontrado' }, { status: 404 })
      }
    }

    const actualizado = await prisma.movimiento.update({
      where: { id: numId },
      data: {
        ...(tipo !== undefined ? { tipo } : {}),
        ...(monto !== undefined ? { monto } : {}),
        ...(fecha !== undefined ? { fecha: new Date(`${fecha}T12:00:00`) } : {}),
        ...(nota !== undefined ? { nota } : {}),
        ...(titularFinal !== undefined ? { titularId: titularFinal } : {}),
      },
      include: { titular: { select: { nombre: true } } },
    })

    return NextResponse.json({
      id: actualizado.id,
      tipo: actualizado.tipo,
      monto: actualizado.monto.toString(),
      fecha: actualizado.fecha.toISOString(),
      nota: actualizado.nota,
      created_at: actualizado.created_at.toISOString(),
      titularId: actualizado.titularId,
      titular_nombre: actualizado.titular?.nombre ?? null,
    })
  } catch (error) {
    console.error('[PATCH /api/movimientos/[id]]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await getSession()
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const numId = parseInt(id, 10)

  if (isNaN(numId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    await prisma.movimiento.delete({ where: { id: numId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
  }
}
