'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PlusCircle, Trash2, Loader2, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, formatDateInput, cn } from '@/lib/utils'
import type { Movimiento } from '@/types'

interface Props {
  pagos: Movimiento[]
  totalPagado: number
  moneda: string
}

const CAPITAL = 100_000

export function PrestamoView({ pagos, totalPagado, moneda }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ monto: '', fecha: formatDateInput(new Date()), nota: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.monto || parseFloat(form.monto) <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'INTERES_PRESTAMO_100K',
          monto: parseFloat(form.monto),
          fecha: form.fecha,
          nota: form.nota || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error: string }
        toast.error(err.error ?? 'Error al guardar')
        return
      }
      toast.success('Abono de interés registrado')
      setForm({ monto: '', fecha: formatDateInput(new Date()), nota: '' })
      setShowForm(false)
      router.refresh()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (confirmId !== id) {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
      return
    }
    setDeletingId(id)
    try {
      const res = await fetch(`/api/movimientos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Movimiento eliminado')
        router.refresh()
      } else {
        toast.error('Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-[#71717A] uppercase tracking-wide mb-1">Capital</p>
          <p className="text-2xl font-bold font-mono text-[#09090B]">
            {formatCurrency(CAPITAL, moneda)}
          </p>
          <p className="text-xs text-[#71717A] mt-1">Préstamo fijo</p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-[#71717A] uppercase tracking-wide mb-1">Total intereses pagados</p>
          <p className="text-2xl font-bold font-mono text-[#16A34A]">
            {formatCurrency(totalPagado, moneda)}
          </p>
          <p className="text-xs text-[#71717A] mt-1">
            {((totalPagado / CAPITAL) * 100).toFixed(2)}% del capital
          </p>
        </div>

        <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-[#71717A] uppercase tracking-wide mb-1">Pagos registrados</p>
          <p className="text-2xl font-bold font-mono text-[#2563EB]">
            {pagos.length}
          </p>
          <p className="text-xs text-[#71717A] mt-1">
            {pagos.length === 0
              ? 'Sin pagos aún'
              : `Promedio ${formatCurrency(totalPagado / pagos.length, moneda)}`}
          </p>
        </div>
      </div>

      {/* Botón + formulario */}
      <div className="space-y-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar abono de interés
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#E4E4E7] rounded-xl p-5 shadow-sm max-w-md space-y-4"
          >
            <p className="text-sm font-semibold text-[#09090B]">Nuevo abono — Interés Préstamo 100K</p>

            <div>
              <label className="block text-xs font-medium text-[#71717A] mb-1">Monto *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  required
                  className="w-full pl-7 pr-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#71717A] mb-1">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#71717A] mb-1">
                Nota <span className="font-normal text-[#A1A1AA]">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="ej. Interés mes de abril"
                value={form.nota}
                onChange={(e) => setForm({ ...form, nota: e.target.value })}
                maxLength={200}
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-[#09090B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#2563EB] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-white border border-[#E4E4E7] text-[#09090B] rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lista de pagos */}
      {pagos.length === 0 ? (
        <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 text-center shadow-sm">
          <TrendingUp className="w-8 h-8 text-[#E4E4E7] mx-auto mb-3" />
          <p className="text-sm text-[#71717A]">No hay abonos registrados</p>
          <p className="text-xs text-[#A1A1AA] mt-1">Usa el botón de arriba para registrar el primero</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E4E7] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4E4E7] bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-[#71717A] uppercase tracking-wide">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#71717A] uppercase tracking-wide hidden sm:table-cell">Nota</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-b border-[#E4E4E7] last:border-0 hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-[#71717A] whitespace-nowrap">{formatDate(p.fecha)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-[#16A34A]">
                    +{formatCurrency(p.monto, moneda)}
                  </td>
                  <td className="px-4 py-3 text-[#71717A] hidden sm:table-cell max-w-[200px] truncate">
                    {p.nota ?? <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      title={confirmId === p.id ? 'Clic de nuevo para confirmar' : 'Eliminar'}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors disabled:opacity-50',
                        confirmId === p.id
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'text-[#71717A] hover:text-[#DC2626] hover:bg-red-50'
                      )}
                    >
                      {deletingId === p.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
