'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BalanceNino, MovimientoNino, TIPO_MOVIMIENTO_NINO_LABELS } from '@/types'
import { format } from 'date-fns'

const FormSchema = z.object({
  tipo: z.enum(['PAGO_PADRE', 'RETIRO_NINO', 'REGALO_DINERO']),
  monto: z.string().min(1, 'Requerido').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Debe ser mayor a 0'
  ),
  fecha: z.string().min(1, 'Requerido'),
  nota: z.string().optional(),
})

type FormData = z.infer<typeof FormSchema>

interface NuevoMovimientoNinoFormProps {
  ninoId: number
  onMovimientoAdded: (movimiento: MovimientoNino, balance: BalanceNino) => void
}

export function NuevoMovimientoNinoForm({
  ninoId,
  onMovimientoAdded,
}: NuevoMovimientoNinoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fecha: format(new Date(), 'yyyy-MM-dd'),
      tipo: 'PAGO_PADRE',
      monto: '',
      nota: '',
    },
  })

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/ninos/${ninoId}/movimientos`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: data.tipo,
            monto: parseFloat(data.monto),
            fecha: new Date(`${data.fecha}T00:00:00`).toISOString(),
            nota: data.nota || null,
          }),
        })

        if (!response.ok) {
          throw new Error('Error creating movimiento')
        }

        const result = await response.json()
        onMovimientoAdded(result.movimiento, result.balance)
        reset()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al crear movimiento'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [ninoId, onMovimientoAdded, reset]
  )

  return (
    <div className="bg-white rounded-lg border border-[#E4E4E7] p-6">
      <h3 className="text-lg font-semibold text-[#09090B] mb-4">
        Nuevo Movimiento
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Tipo
          </label>
          <select
            {...register('tipo')}
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          >
            {Object.entries(TIPO_MOVIMIENTO_NINO_LABELS).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              )
            )}
          </select>
          {errors.tipo && (
            <p className="text-xs text-[#EF4444] mt-1">
              {errors.tipo.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Monto
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('monto')}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
          {errors.monto && (
            <p className="text-xs text-[#EF4444] mt-1">
              {errors.monto.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Fecha
          </label>
          <input
            type="date"
            {...register('fecha')}
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
          {errors.fecha && (
            <p className="text-xs text-[#EF4444] mt-1">
              {errors.fecha.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Nota (opcional)
          </label>
          <textarea
            {...register('nota')}
            placeholder="Agregar nota..."
            rows={3}
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="bg-[#FEE2E2] border border-[#FECACA] rounded p-3">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creando...' : 'Crear Movimiento'}
        </button>
      </form>
    </div>
  )
}
