'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { TIPO_LABELS } from '@/types'
import type { TipoMovimiento } from '@/types'
import { X } from 'lucide-react'

const TODOS_LOS_TIPOS: TipoMovimiento[] = [
  'RETIRO_PERSONAL',
  'RETIRO_NEGOCIO',
  'ABONO_PERSONAL',
  'ABONO_NEGOCIO',
  'FEE_BANCARIO',
  'ABONO_INTERES',
  'RETIRO_DUENO',
  'CREDITO_DUENO',
]

export function FiltroBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tipo = searchParams.get('tipo') ?? ''
  const desde = searchParams.get('desde') ?? ''
  const hasta = searchParams.get('hasta') ?? ''

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters = tipo || desde || hasta

  function clearAll() {
    router.push(pathname)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={tipo}
        onChange={(e) => updateParam('tipo', e.target.value)}
        className="px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors"
      >
        <option value="">Todos los tipos</option>
        {TODOS_LOS_TIPOS.map((t) => (
          <option key={t} value={t}>
            {TIPO_LABELS[t]}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <label className="text-sm text-[#71717A]">Desde:</label>
        <input
          type="date"
          value={desde}
          onChange={(e) => updateParam('desde', e.target.value)}
          className="px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-[#71717A]">Hasta:</label>
        <input
          type="date"
          value={hasta}
          onChange={(e) => updateParam('hasta', e.target.value)}
          className="px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors"
        />
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#71717A] hover:text-[#09090B] border border-[#E4E4E7] rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  )
}
