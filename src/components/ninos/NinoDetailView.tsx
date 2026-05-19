'use client'

import { useState, useCallback } from 'react'
import { BalanceNino, MovimientoNino, Nino, TIPO_MOVIMIENTO_NINO_LABELS } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NuevoMovimientoNinoForm } from './NuevoMovimientoNinoForm'
import { Trash2 } from 'lucide-react'

interface NinoDetailViewProps {
  nino: Nino & { movimientos?: MovimientoNino[] }
  balance: BalanceNino
  movimientos: MovimientoNino[]
}

export function NinoDetailView({
  nino,
  balance,
  movimientos: initialMovimientos,
}: NinoDetailViewProps) {
  const [movimientos, setMovimientos] = useState(initialMovimientos)
  const [balanceState, setBalanceState] = useState(balance)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; timer: NodeJS.Timeout } | null>(
    null
  )

  const handleMovimientoAdded = useCallback(
    (newMovimiento: MovimientoNino, newBalance: BalanceNino) => {
      setMovimientos((prev) => [newMovimiento, ...prev])
      setBalanceState(newBalance)
    },
    []
  )

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    const timer = setTimeout(() => {
      setDeletingId(null)
      setDeleteConfirm(null)
    }, 3000)
    setDeleteConfirm({ id, timer })
  }

  const handleConfirmDelete = async (id: number) => {
    if (deleteConfirm?.timer) {
      clearTimeout(deleteConfirm.timer)
    }

    try {
      const response = await fetch(`/api/ninos/${nino.id}/movimientos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Error deleting movimiento')
      }

      const result = await response.json()
      setMovimientos((prev) => prev.filter((m) => m.id !== id))
      setBalanceState(result.balance)
      setDeletingId(null)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting movimiento:', error)
      setDeletingId(null)
      setDeleteConfirm(null)
    }
  }

  const handleCancelDelete = () => {
    if (deleteConfirm?.timer) {
      clearTimeout(deleteConfirm.timer)
    }
    setDeletingId(null)
    setDeleteConfirm(null)
  }

  const deudaActual = parseFloat(balanceState.deuda_actual)
  const deudaColor =
    deudaActual > 1000
      ? '#EF4444'
      : deudaActual > 500
        ? '#F97316'
        : '#10B981'

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E4E4E7]">
          <p className="text-xs text-[#71717A] mb-1">Deuda Inicial</p>
          <p className="text-lg font-semibold text-[#09090B]">
            ${parseFloat(balanceState.deuda_inicial).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E4E4E7]">
          <p className="text-xs text-[#71717A] mb-1">Pagos Padre</p>
          <p className="text-lg font-semibold text-green-600">
            -${parseFloat(balanceState.pagos_padre).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E4E4E7]">
          <p className="text-xs text-[#71717A] mb-1">Retiros Niño</p>
          <p className="text-lg font-semibold text-red-600">
            +${parseFloat(balanceState.retiros_nino).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E4E4E7]">
          <p className="text-xs text-[#71717A] mb-1">Regalos</p>
          <p className="text-lg font-semibold text-red-600">
            +${parseFloat(balanceState.regalos).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-2" style={{ borderColor: deudaColor }}>
          <p className="text-xs text-[#71717A] mb-1">Deuda Actual</p>
          <p className="text-lg font-semibold" style={{ color: deudaColor }}>
            ${deudaActual.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NuevoMovimientoNinoForm
            ninoId={nino.id}
            onMovimientoAdded={handleMovimientoAdded}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-[#E4E4E7] p-6">
            <h3 className="text-lg font-semibold text-[#09090B] mb-4">Historial de Movimientos</h3>

            {movimientos.length === 0 ? (
              <p className="text-sm text-[#71717A] py-8 text-center">No hay movimientos</p>
            ) : (
              <div className="space-y-3">
                {movimientos.map((mov) => (
                  <div
                    key={mov.id}
                    className="flex items-center justify-between p-4 border border-[#E4E4E7] rounded-lg hover:bg-[#F4F4F5] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#09090B]">
                            {TIPO_MOVIMIENTO_NINO_LABELS[mov.tipo]}
                          </p>
                          <p className="text-xs text-[#71717A]">
                            {format(new Date(mov.fecha), 'dd MMM yyyy', { locale: es })}
                          </p>
                        </div>
                      </div>
                      {mov.nota && (
                        <p className="text-xs text-[#71717A] mt-1 ml-0">Nota: {mov.nota}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color:
                            mov.tipo === 'PAGO_PADRE' ? '#10B981' : '#EF4444',
                        }}
                      >
                        {mov.tipo === 'PAGO_PADRE' ? '-' : '+'}$
                        {parseFloat(mov.monto).toFixed(2)}
                      </p>

                      {deletingId === mov.id && deleteConfirm ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmDelete(mov.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="px-2 py-1 text-xs bg-[#E4E4E7] text-[#09090B] rounded hover:bg-[#D4D4D8]"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteClick(mov.id)}
                          className="p-2 text-[#71717A] hover:text-red-600 hover:bg-[#FEE2E2] rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
