'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus, Wallet } from 'lucide-react'
import type { BalanceTitular } from '@/types'
import { formatCurrency } from '@/lib/utils'

export function TitularesView({ titulares }: { titulares: BalanceTitular[] }) {
  const router = useRouter()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [montoInicial, setMontoInicial] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function agregarTitular(e: React.FormEvent) {
    e.preventDefault()

    const monto = parseFloat(montoInicial)
    if (!nombre.trim()) {
      toast.error('Escribe el nombre')
      return
    }
    if (isNaN(monto) || monto < 0) {
      toast.error('El monto inicial debe ser 0 o mayor')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch('/api/titulares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), monto_inicial: monto }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        toast.error(err.error ?? 'Error al guardar')
        return
      }

      toast.success(`${nombre.trim()} agregado`)
      setNombre('')
      setMontoInicial('')
      setMostrarForm(false)
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-[#71717A] max-w-xl">
          Personas dueñas de una parte del dinero de la cuenta. Cuando registras un
          retiro de titular en <strong>Nuevo Movimiento</strong>, baja el balance de la
          cuenta y se descuenta de esa persona — sin tocar tu deuda.
        </p>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Agregar persona
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={agregarTitular}
          className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm space-y-4 max-w-lg"
        >
          <div>
            <label className="block text-sm font-medium text-[#09090B] mb-1.5">
              Nombre <span className="text-[#DC2626]">*</span>
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={60}
              placeholder="Ej. Mamá, Carlos, José"
              className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm placeholder:text-[#71717A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#09090B] mb-1.5">
              Monto inicial <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-mono">
                $
              </span>
              <input
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm placeholder:text-[#71717A]"
              />
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              Cuánto dinero de esta cuenta le pertenece a esta persona hoy.
            </p>
          </div>
          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-[#2563EB] text-white rounded-lg px-4 py-2.5 font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar persona'
            )}
          </button>
        </form>
      )}

      {titulares.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E4E4E7] rounded-xl p-10 text-center">
          <Wallet className="w-8 h-8 text-[#71717A] mx-auto mb-3" />
          <p className="text-sm text-[#71717A]">
            Todavía no hay personas registradas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {titulares.map((t) => {
            const seAcabo = parseFloat(t.disponible) <= 0
            return (
              <div
                key={t.titularId}
                className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-[#09090B]">{t.nombre}</p>
                <p
                  className={`font-mono text-[28px] font-bold leading-tight mt-1 ${
                    seAcabo ? 'text-[#DC2626]' : 'text-[#16A34A]'
                  }`}
                >
                  {formatCurrency(t.disponible)}
                </p>
                <p className="text-xs text-[#71717A] mb-3">disponible</p>

                <dl className="space-y-1 text-xs border-t border-[#E4E4E7] pt-3">
                  <div className="flex justify-between">
                    <dt className="text-[#71717A]">Inicial</dt>
                    <dd className="font-mono text-[#09090B]">
                      {formatCurrency(t.monto_inicial)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#71717A]">Ha retirado</dt>
                    <dd className="font-mono text-[#DC2626]">
                      −{formatCurrency(t.total_retirado)}
                    </dd>
                  </div>
                  {parseFloat(t.total_depositado) > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-[#71717A]">Ha depositado</dt>
                      <dd className="font-mono text-[#16A34A]">
                        +{formatCurrency(t.total_depositado)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
