import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

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
