import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { MovimientosTable } from '@/components/movimientos/MovimientosTable'
import { FiltroBar } from '@/components/movimientos/FiltroBar'
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TipoMovimiento } from '@/types'

export const dynamic = 'force-dynamic'

const VALID_TIPOS = new Set([
  'RETIRO_PERSONAL',
  'RETIRO_NEGOCIO',
  'ABONO_PERSONAL',
  'ABONO_NEGOCIO',
  'FEE_BANCARIO',
  'ABONO_INTERES',
  'RETIRO_DUENO',
  'CREDITO_DUENO',
])

interface PageProps {
  searchParams: Promise<{
    tipo?: string
    desde?: string
    hasta?: string
    page?: string
  }>
}

export default async function MovimientosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const limit = 20

  const where: Record<string, unknown> = {}

  if (params.tipo && VALID_TIPOS.has(params.tipo)) {
    where.tipo = params.tipo as TipoMovimiento
  }

  if (params.desde || params.hasta) {
    where.fecha = {
      ...(params.desde ? { gte: new Date(params.desde) } : {}),
      ...(params.hasta ? { lte: new Date(`${params.hasta}T23:59:59`) } : {}),
    }
  }

  const [movimientos, total, config] = await Promise.all([
    prisma.movimiento.findMany({
      where,
      orderBy: [{ fecha: 'desc' }, { created_at: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.movimiento.count({ where }),
    prisma.config.findFirst(),
  ])

  const moneda = config?.moneda ?? 'MXN'
  const totalPages = Math.ceil(total / limit)

  const movimientosFormatted = movimientos.map((m: (typeof movimientos)[0]) => ({
    id: m.id,
    tipo: m.tipo,
    monto: m.monto.toString(),
    fecha: m.fecha.toISOString(),
    nota: m.nota,
    created_at: m.created_at.toISOString(),
  }))

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams()
    if (params.tipo) sp.set('tipo', params.tipo)
    if (params.desde) sp.set('desde', params.desde)
    if (params.hasta) sp.set('hasta', params.hasta)
    sp.set('page', p.toString())
    return `/movimientos?${sp.toString()}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-[#71717A] flex-1">
          {total} movimiento{total !== 1 ? 's' : ''} en total
        </p>
        <Link
          href="/nuevo"
          className="inline-flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo
        </Link>
      </div>

      <Suspense fallback={null}>
        <FiltroBar />
      </Suspense>

      <MovimientosTable movimientos={movimientosFormatted} moneda={moneda} />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-[#71717A]">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildPageUrl(page - 1)}
                className="flex items-center gap-1 px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] hover:bg-zinc-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#71717A] opacity-50 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </span>
            )}

            {page < totalPages ? (
              <Link
                href={buildPageUrl(page + 1)}
                className="flex items-center gap-1 px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] hover:bg-zinc-50 transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#71717A] opacity-50 cursor-not-allowed">
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
