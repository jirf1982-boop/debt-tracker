'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  balance_inicial: z
    .string()
    .min(1, 'Ingresa el balance inicial')
    .refine((v) => !isNaN(parseFloat(v)), { message: 'Monto inválido' }),
  nombre_acreedor: z.string().min(1, 'Ingresa el nombre').max(100),
  moneda: z.enum(['MXN', 'USD']),
})

type FormData = z.infer<typeof schema>

interface ConfigFormProps {
  initialData?: {
    balance_inicial: string
    nombre_acreedor: string
    moneda: 'MXN' | 'USD'
  }
}

export function ConfigForm({ initialData }: ConfigFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      balance_inicial: initialData?.balance_inicial ?? '',
      nombre_acreedor: initialData?.nombre_acreedor ?? '',
      moneda: initialData?.moneda ?? 'MXN',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balance_inicial: parseFloat(data.balance_inicial),
          nombre_acreedor: data.nombre_acreedor,
          moneda: data.moneda,
        }),
      })

      if (!res.ok) {
        const err = await res.json() as { error: string }
        toast.error(err.error ?? 'Error al guardar')
        return
      }

      toast.success('Configuración guardada')
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    }
  }

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Nombre del acreedor <span className="text-[#DC2626]">*</span>
          </label>
          <input
            {...register('nombre_acreedor')}
            type="text"
            placeholder="Ej: Papá, Carlos, etc."
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm placeholder:text-[#71717A]"
          />
          {errors.nombre_acreedor && (
            <p className="text-xs text-[#DC2626] mt-1">{errors.nombre_acreedor.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Balance inicial de la cuenta <span className="text-[#DC2626]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-mono">$</span>
            <input
              {...register('balance_inicial')}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm placeholder:text-[#71717A]"
            />
          </div>
          {errors.balance_inicial && (
            <p className="text-xs text-[#DC2626] mt-1">{errors.balance_inicial.message}</p>
          )}
          <p className="text-xs text-[#71717A] mt-1">
            El balance real de la cuenta bancaria al inicio del registro.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#09090B] mb-1.5">
            Moneda
          </label>
          <select
            {...register('moneda')}
            className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm"
          >
            <option value="MXN">MXN — Peso mexicano</option>
            <option value="USD">USD — Dólar americano</option>
          </select>
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
            'Guardar configuración'
          )}
        </button>
      </form>
    </div>
  )
}
