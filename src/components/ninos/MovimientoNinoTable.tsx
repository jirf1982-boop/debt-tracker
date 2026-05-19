'use client'

import { MovimientoNino, TIPO_MOVIMIENTO_NINO_LABELS } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface MovimientoNinoTableProps {
  movimientos: MovimientoNino[]
  onDelete: (movimientoId: number) => void
  isLoading: boolean
}

export function MovimientoNinoTable({
  movimientos,
  onDelete,
  isLoading,
}: MovimientoNinoTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteCountdown, setDeleteCountdown] = useState<number>(0)

  const handleDeleteClick = (movimientoId: number) => {
    if (deletingId === movimientoId) {
      // Confirm delete
      onDelete(movimientoId)
      setDeletingId(null)
      setDeleteCountdown(0)
    } else {
      // Start countdown
      setDeletingId(movimientoId)
      setDeleteCountdown(3)

      const interval = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setDeletingId(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const getTypeColor = (tipo: MovimientoNino['tipo']) => {
    switch (tipo) {
      case 'PAGO_PADRE':
        return 'text-[#10B981] bg-[#ECFDF5]'
      case 'RETIRO_NINO':
        return 'text-[#EF4444] bg-[#FEE2E2]'
      case 'REGALO_DINERO':
        return 'text-[#F59E0B] bg-[#FEF3C7]'
    }
  }

  if (movimientos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E4E4E7] p-8">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-[#A1A1A6] mb-3" />
          <h3 className="text-lg font-medium text-[#71717A] mb-1">
            Sin movimientos
          </h3>
          <p className="text-sm text-[#A1A1A6]">
            Agrega el primer movimiento para comenzar a registrar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-[#E4E4E7] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F4F4F5]">
              <th className="px-4 py-3 text-left font-semibold text-[#09090B]">
                Tipo
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[#09090B]">
                Monto
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[#09090B]">
                Fecha
              </th>
              <th className="px-4 py-3 text-left font-semibold text-[#09090B]">
                Nota
              </th>
              <th className="px-4 py-3 text-center font-semibold text-[#09090B]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr
                key={mov.id}
                className="border-b border-[#E4E4E7] hover:bg-[#F4F4F5] transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                      mov.tipo
                    )}`}
                  >
                    {TIPO_MOVIMIENTO_NINO_LABELS[mov.tipo]}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-[#09090B]">
                  ${parseFloat(mov.monto).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-[#71717A]">
                  {format(new Date(mov.fecha), 'dd MMM yyyy', { locale: es })}
                </td>
                <td className="px-4 py-3 text-[#71717A] max-w-xs truncate">
                  {mov.nota || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteClick(mov.id)}
                    disabled={isLoading || (deletingId !== null && deletingId !== mov.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                      deletingId === mov.id
                        ? 'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]'
                        : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#FECACA] hover:text-[#DC2626]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Trash2 className="w-3 h-3" />
                    {deletingId === mov.id ? (
                      <span>{deleteCountdown}s</span>
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
