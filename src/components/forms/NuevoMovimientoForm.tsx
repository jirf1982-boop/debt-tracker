'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { TIPO_LABELS } from '@/types'
import type { TipoMovimiento } from '@/types'
import { formatDateInput } from '@/lib/utils'

const schema = z.object({
  tipo: z.enum([
    'RETIRO_PERSONAL',
    'RETIRO_NEGOCIO',
    'ABONO_PERSONAL',
    'ABONO_NEGOCIO',
    'FEE_BANCARIO',
    'ABONO_INTERES',
    'RETIRO_DUENO',
    'CREDITO_DUENO',
    'INTERES_PRESTAMO_100K',
  ] as const),
  monto: z
    .string()
    .min(1, 'Ingresa un monto')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'El monto debe ser mayor a 0',
    }),
  fecha: z.string().min(1, 'Selecciona una fecha'),
  nota: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

type FormData = z.infer<typeof schema>

const TIPO_OPTIONS: { value: TipoMovimiento; label: string; group: string }[] = [
  { value: 'RETIRO_PERSONAL', label: TIPO_LABELS.RETIRO_PERSONAL, group: 'Retiros' },
  { value: 'RETIRO_NEGOCIO', label: TIPO_LABELS.RETIRO_NEGOCIO, group: 'Retiros' },
  { value: 'ABONO_PERSONAL', label: TIPO_LABELS.ABONO_PERSONAL, group: 'Abonos' },
  { value: 'ABONO_NEGOCIO', label: TIPO_LABELS.ABONO_NEGOCIO, group: 'Abonos' },
  { value: 'FEE_BANCARIO', label: TIPO_LABELS.FEE_BANCARIO, group: 'Cuenta' },
  { value: 'ABONO_INTERES', label: TIPO_LABELS.ABONO_INTERES, group: 'Cuenta' },
  { value: 'RETIRO_DUENO', label: TIPO_LABELS.RETIRO_DUENO, group: 'Dueño' },
  { value: 'CREDITO_DUENO', label: TIPO_LABELS.CREDITO_DUENO, group: 'Dueño' },
  { value: 'INTERES_PRESTAMO_100K', label: TIPO_LABELS.INTERES_PRESTAMO_100K, group: 'Préstamo' },
]

export function NuevoMovimientoForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha: formatDateInput(new Date()),
    },
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: data.tipo,
          monto: parseFloat(data.monto),
          fecha: data.fecha,
          nota: data.nota || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json() as { error: string }
        toast.error(err.error ?? 'Error al guardar')
        return
      }

      toast.success('Movimiento registrado')
      reset({ fecha: formatDateInput(new Date()) })
      router.refresh()
      router.push('/dashboard')
    } catch {
      toast.error('Error de conexión')
    }
  }

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Tipo de movimiento <span className="text-[#DC2626]">*</span>
          </label>
          <select
            {...register('tipo')}
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm"
          >
            <option value="">Selecciona un tipo</option>
            {['Retiros', 'Abonos', 'Cuenta', 'Dueño', 'Préstamo'].map((group) => (
              <optgroup key={group} label={group}>
                {TIPO_OPTIONS.filter((o) => o.group === group).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.tipo && (
            <p className="text-xs text-[#DC2626] mt-1">{errors.tipo.message}</p>
          )}
        </div>

        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Monto <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-mono">
              $
            </span>
            <input
              {...register('monto')}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm placeholder:text-[#71717A]"
            />
          </div>
          {errors.monto && (
            <p className="text-xs text-[#DC2626] mt-1">{errors.monto.message}</p>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Fecha <span className="text-[#DC2626]">*</span>
          </label>
          <input
            {...register('fecha')}
            type="date"
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm"
          />
          {errors.fecha && (
            <p className="text-xs text-[#DC2626] mt-1">{errors.fecha.message}</p>
          )}
        </div>

        {/* Nota */}
        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Nota{' '}
            <span className="text-[#71717A] font-normal">(opcional)</span>
          </label>
          <textarea
            {...register('nota')}
            rows={3}
            placeholder="Descripción del movimiento..."
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm placeholder:text-[#71717A] resize-none"
          />
          {errors.nota && (
            <p className="text-xs text-[#DC2626] mt-1">{errors.nota.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#2563EB] text-white rounded-lg px-4 py-2.5 font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar movimiento'
          )}
        </button>
      </form>
    </div>
  )
}
