'use client'

import Link from 'next/link'
import { BalanceNino } from '@/types'

interface NinosListViewProps {
  ninos: BalanceNino[]
}

export function NinosListView({ ninos }: NinosListViewProps) {
  if (ninos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#71717A] mb-4">No hay hijos registrados</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {ninos.map((nino) => {
        const deudaActual = parseFloat(nino.deuda_actual)
        const deudaColor =
          deudaActual > 1000
            ? '#EF4444'
            : deudaActual > 500
              ? '#F97316'
              : '#10B981'

        return (
          <Link
            key={nino.ninoId}
            href={`/ninos/${nino.ninoId}`}
            className="block p-6 border border-[#E4E4E7] rounded-lg hover:shadow-md transition-shadow bg-white"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-[#09090B] mb-1">
                {nino.nombre}
              </h3>
              <p className="text-sm text-[#71717A]">Deuda pendiente</p>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold" style={{ color: deudaColor }}>
                ${deudaActual.toFixed(2)}
              </p>
              <p className="text-xs text-[#71717A] mt-1">
                Deuda inicial: ${parseFloat(nino.deuda_inicial).toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E4E4E7]">
              <div>
                <p className="text-xs text-[#71717A] mb-1">Pagos</p>
                <p className="text-sm font-semibold text-green-600">
                  -${parseFloat(nino.pagos_padre).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#71717A] mb-1">Retiros</p>
                <p className="text-sm font-semibold text-red-600">
                  +${parseFloat(nino.retiros_nino).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#71717A] mb-1">Regalos</p>
                <p className="text-sm font-semibold text-red-600">
                  +${parseFloat(nino.regalos).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
