'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { TIPO_LABELS, TIPO_OPTIONS, TIPOS_MOVIMIENTO, GRUPOS_TIPO } from '@/types'
import type { BalanceTitular } from '@/types'
import { formatDateInput, formatCurrency } from '@/lib/utils'

const schema = z.object({
  tipo: z.enum(TIPOS_MOVIMIENTO),
  monto: z
    .string()
    .min(1, 'Ingresa un monto')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: 'El monto debe ser mayor a 0',
    }),
  fecha: z.string().min(1, 'Selecciona una fecha'),
  nota: z.string().max(200, 'Máximo 200 caracteres').optional(),
  titularId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function NuevoMovimientoForm({ titulares = [] }: { titulares?: BalanceTitular[] }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha: formatDateInput(new Date()),
    },
  })

  const tipoActual = watch('tipo')
  const esDeTitular = tipoActual === 'RETIRO_DUENO' || tipoActual === 'CREDITO_DUENO'

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
          titularId:
            esDeTitular && data.titularId ? parseInt(data.titularId, 10) : undefined,
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
            {GRUPOS_TIPO.map((group) => (
              <optgroup key={group} label={group}>
                {TIPO_OPTIONS.filter((o) => o.group === group).map((o) => (
                  <option key={o.value} value={o.value}>
                    {TIPO_LABELS[o.value]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.tipo && (
            <p className="text-xs text-[#DC2626] mt-1">{errors.tipo.message}</p>
          )}
        </div>

        {/* Titular — solo para movimientos de titular */}
        {esDeTitular && (
          <div>
            <label className="block text-sm font-medium text-[#09090B] mb-1.5">
              ¿De quién es este dinero?{' '}
              <span className="text-[#71717A] font-normal">(opcional)</span>
            </label>
            {titulares.length === 0 ? (
              <p className="text-xs text-[#71717A] border border-dashed border-[#E4E4E7] rounded-lg px-3 py-2.5">
                Aún no has registrado personas. Ve a <strong>Titulares</strong> para
                agregar a tu mamá y a tus hermanos.
              </p>
            ) : (
              <select
                {...register('titularId')}
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm"
              >
                <option value="">Sin asignar</option>
                {titulares.map((t) => (
                  <option key={t.titularId} value={String(t.titularId)}>
                    {t.nombre} — disponible {formatCurrency(t.disponible)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

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
