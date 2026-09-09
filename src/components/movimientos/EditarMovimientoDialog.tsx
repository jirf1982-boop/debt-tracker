'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import { TIPO_LABELS, TIPO_OPTIONS, GRUPOS_TIPO } from '@/types'
import type { Movimiento, TipoMovimiento, BalanceTitular } from '@/types'
import { formatCurrency, formatDateInput } from '@/lib/utils'

interface Props {
  movimiento: Movimiento
  moneda: string
  titulares: BalanceTitular[]
  onClose: () => void
}

export function EditarMovimientoDialog({ movimiento: m, moneda, titulares, onClose }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoMovimiento>(m.tipo)
  const [monto, setMonto] = useState(m.monto)
  const [fecha, setFecha] = useState(formatDateInput(m.fecha))
  const [nota, setNota] = useState(m.nota ?? '')
  const [titularId, setTitularId] = useState(m.titularId ? String(m.titularId) : '')
  const [guardando, setGuardando] = useState(false)

  const esDeTitular = tipo === 'RETIRO_DUENO' || tipo === 'CREDITO_DUENO'

  const montoCambio = monto !== m.monto
  const tipoCambio = tipo !== m.tipo
  const titularCambio =
    esDeTitular && titularId !== (m.titularId ? String(m.titularId) : '')
  const hayCambios =
    montoCambio || tipoCambio || titularCambio ||
    fecha !== formatDateInput(m.fecha) || nota !== (m.nota ?? '')

  async function guardar(e: React.FormEvent) {
    e.preventDefault()

    const montoNum = parseFloat(monto)
    if (isNaN(montoNum) || montoNum <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    setGuardando(true)
    try {
      const res = await fetch(`/api/movimientos/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          monto: montoNum,
          fecha,
          nota: nota.trim() ? nota.trim() : null,
          titularId: esDeTitular && titularId ? parseInt(titularId, 10) : null,
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        toast.error(err.error ?? 'Error al guardar')
        return
      }

      toast.success('Movimiento actualizado')
      onClose()
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors text-sm'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7] sticky top-0 bg-white">
          <h2 className="font-semibold text-[#09090B]">Editar movimiento</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:bg-zinc-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={guardar} className="p-5 space-y-4">
          {/* Referencia de lo guardado hoy */}
          <div className="bg-zinc-50 border border-[#E4E4E7] rounded-lg px-3 py-2.5 text-xs text-[#71717A]">
            Guardado hoy:{' '}
            <span className="font-medium text-[#09090B]">{TIPO_LABELS[m.tipo]}</span>{' '}
            por{' '}
            <span className="font-mono font-medium text-[#09090B]">
              {formatCurrency(m.monto, moneda)}
            </span>
            {m.titular_nombre && <> · {m.titular_nombre}</>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09090B] mb-1.5">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoMovimiento)}
              className={inputClass}
            >
              {GRUPOS_TIPO.map((g) => (
                <optgroup key={g} label={g}>
                  {TIPO_OPTIONS.filter((o) => o.group === g).map((o) => (
                    <option key={o.value} value={o.value}>
                      {TIPO_LABELS[o.value]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {tipoCambio && (
              <p className="text-xs text-[#DC2626] mt-1">
                Cambiar el tipo cambia cómo se cuenta este dinero en tus balances.
              </p>
            )}
          </div>

          {esDeTitular && (
            <div>
              <label className="block text-sm font-medium text-[#09090B] mb-1.5">
                ¿De quién es este dinero?
              </label>
              {titulares.length === 0 ? (
                <p className="text-xs text-[#71717A] border border-dashed border-[#E4E4E7] rounded-lg px-3 py-2.5">
                  No hay personas registradas. Agrégalas en Titulares.
                </p>
              ) : (
                <select
                  value={titularId}
                  onChange={(e) => setTitularId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Sin asignar</option>
                  {titulares.map((t) => (
                    <option key={t.titularId} value={String(t.titularId)}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#09090B] mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-mono">
                $
              </span>
              <input
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                type="number"
                step="0.01"
                min="0.01"
                className={`${inputClass} pl-7 font-mono`}
              />
            </div>
            {montoCambio && (
              <p className="text-xs text-[#71717A] mt-1">
                Antes {formatCurrency(m.monto, moneda)} → ahora{' '}
                <span className="font-medium text-[#09090B]">
                  {formatCurrency(monto || '0', moneda)}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09090B] mb-1.5">Fecha</label>
            <input
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              type="date"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09090B] mb-1.5">
              Nota <span className="text-[#71717A] font-normal">(opcional)</span>
            </label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              maxLength={200}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#E4E4E7] text-[#09090B] rounded-lg px-4 py-2.5 font-medium text-sm hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || !hayCambios}
              className="flex-1 bg-[#2563EB] text-white rounded-lg px-4 py-2.5 font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
