'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { TIPO_LABELS, TIPOS_NEGATIVOS } from '@/types'
import type { Movimiento } from '@/types'

interface MovimientoRowProps {
  movimiento: Movimiento
  moneda: string
}

export function MovimientoRow({ movimiento: m, moneda }: MovimientoRowProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const isNegativo = TIPOS_NEGATIVOS.includes(m.tipo)

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true)
      setTimeout(() => setConfirm(false), 3000)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/movimientos/${m.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Movimiento eliminado')
        router.refresh()
      } else {
        toast.error('Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeleting(false)
      setConfirm(false)
    }
  }

  return (
    <tr className="border-b border-[#E4E4E7] hover:bg-zinc-50 transition-colors">
      <td className="px-4 py-3 text-sm text-[#71717A] whitespace-nowrap">
        {formatDate(m.fecha)}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            isNegativo
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          )}
        >
          {TIPO_LABELS[m.tipo]}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={cn(
            'font-mono font-medium text-sm',
            isNegativo ? 'text-[#DC2626]' : 'text-[#16A34A]'
          )}
        >
          {isNegativo ? '-' : '+'}{formatCurrency(m.monto, moneda)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[#71717A] max-w-[200px] truncate">
        {m.nota ?? <span className="text-zinc-300">—</span>}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleDelete}
          disabled={deleting}
          title={confirm ? 'Clic de nuevo para confirmar' : 'Eliminar'}
          className={cn(
            'p-1.5 rounded-lg transition-colors disabled:opacity-50',
            confirm
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'text-[#71717A] hover:text-[#DC2626] hover:bg-red-50'
          )}
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </td>
    </tr>
  )
}
