import { MovimientoRow } from './MovimientoRow'
import type { Movimiento } from '@/types'

interface MovimientosTableProps {
  movimientos: Movimiento[]
  moneda: string
}

export function MovimientosTable({ movimientos, moneda }: MovimientosTableProps) {
  if (movimientos.length === 0) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm">
        <div className="px-6 py-16 text-center">
          <p className="text-[#71717A] text-sm">No se encontraron movimientos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-zinc-50">
              <th className="px-4 py-3 text-xs font-medium text-[#71717A] uppercase tracking-wider whitespace-nowrap">
                Fecha
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[#71717A] uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[#71717A] uppercase tracking-wider text-right">
                Monto
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[#71717A] uppercase tracking-wider">
                Nota
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[#71717A] uppercase tracking-wider text-right">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <MovimientoRow key={m.id} movimiento={m} moneda={moneda} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
