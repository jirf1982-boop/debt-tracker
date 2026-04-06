import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TIPO_LABELS, TIPOS_NEGATIVOS } from '@/types'
import type { Movimiento } from '@/types'
import { cn } from '@/lib/utils'

interface ResumenRecienteProps {
  movimientos: Movimiento[]
  moneda: string
}

export function ResumenReciente({ movimientos, moneda }: ResumenRecienteProps) {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
        <h2 className="font-semibold text-[#09090B]">Movimientos Recientes</h2>
        <Link
          href="/movimientos"
          className="text-sm text-[#2563EB] hover:underline flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {movimientos.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-[#71717A]">
          No hay movimientos registrados.{' '}
          <Link href="/nuevo" className="text-[#2563EB] hover:underline">
            Agrega el primero
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#E4E4E7]">
          {movimientos.map((m) => {
            const isNegativo = TIPOS_NEGATIVOS.includes(m.tipo)
            return (
              <div key={m.id} className="px-6 py-3.5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        isNegativo
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      )}
                    >
                      {TIPO_LABELS[m.tipo]}
                    </span>
                    {m.nota && (
                      <span className="text-xs text-[#71717A] truncate max-w-[200px]">
                        {m.nota}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">{formatDate(m.fecha)}</p>
                </div>
                <span
                  className={cn(
                    'font-mono font-medium text-sm flex-shrink-0',
                    isNegativo ? 'text-[#DC2626]' : 'text-[#16A34A]'
                  )}
                >
                  {isNegativo ? '-' : '+'}{formatCurrency(m.monto, moneda)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
