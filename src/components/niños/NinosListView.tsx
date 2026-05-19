'use client'

import { BalanceNino } from '@/types'
import { NinoCard } from './NinoCard'
import { AlertCircle } from 'lucide-react'

interface NinosListViewProps {
  ninos: BalanceNino[]
}

export function NinosListView({ ninos }: NinosListViewProps) {
  if (ninos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#F4F4F5] rounded-lg border border-[#E4E4E7]">
        <AlertCircle className="w-12 h-12 text-[#A1A1A6] mb-3" />
        <h3 className="text-lg font-medium text-[#71717A] mb-1">
          No hay niños registrados
        </h3>
        <p className="text-[#A1A1A6] text-sm">
          Crea el primer registro desde la aplicación
        </p>
      </div>
    )
  }

  const totalDeuda = ninos.reduce((sum, nino) => {
    return sum + parseFloat(nino.deuda_actual)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#E4E4E7] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-[#71717A] mb-1">Total Niños</p>
            <p className="text-2xl font-bold text-[#09090B]">{ninos.length}</p>
          </div>
          <div>
            <p className="text-sm text-[#71717A] mb-1">Deuda Total</p>
            <p className="text-2xl font-bold text-[#09090B]">
              ${totalDeuda.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#71717A] mb-1">Deuda Promedio</p>
            <p className="text-2xl font-bold text-[#09090B]">
              ${(totalDeuda / ninos.length).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ninos.map((nino) => (
          <NinoCard key={nino.ninoId} nino={nino} />
        ))}
      </div>
    </div>
  )
}
