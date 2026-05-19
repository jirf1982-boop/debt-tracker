import { BalanceNino } from '@/types'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface NinoCardProps {
  nino: BalanceNino
}

export function NinoCard({ nino }: NinoCardProps) {
  const deudaActual = parseFloat(nino.deuda_actual)
  const pagosPadre = parseFloat(nino.pagos_padre)
  const deudaInicial = parseFloat(nino.deuda_inicial)

  // Color coding based on debt amount
  let debtColor = 'text-[#10B981]' // green - low debt
  if (deudaActual > deudaInicial * 0.75) {
    debtColor = 'text-[#EF4444]' // red - high debt
  } else if (deudaActual > deudaInicial * 0.5) {
    debtColor = 'text-[#F59E0B]' // amber - medium debt
  }

  return (
    <Link href={`/ninos/${nino.ninoId}`}>
      <div className="block h-full bg-white rounded-lg border border-[#E4E4E7] p-5 hover:shadow-md hover:border-[#2563EB] transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#09090B] group-hover:text-[#2563EB] transition-colors">
              {nino.nombre}
            </h3>
            <p className="text-sm text-[#71717A] mt-1">
              Deuda actual
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#A1A1A6] group-hover:text-[#2563EB] transition-colors" />
        </div>

        <div className="space-y-3">
          <div className={`text-3xl font-bold ${debtColor}`}>
            ${deudaActual.toFixed(2)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F4F4F5] rounded p-3">
              <p className="text-xs text-[#71717A] mb-1">Deuda Inicial</p>
              <p className="text-sm font-semibold text-[#09090B]">
                ${deudaInicial.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#F4F4F5] rounded p-3">
              <p className="text-xs text-[#71717A] mb-1">Pagos del Padre</p>
              <p className="text-sm font-semibold text-[#10B981]">
                ${pagosPadre.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
