'use client'

import { BalanceNino, MovimientoNino, Nino } from '@/types'
import { useState } from 'react'
import { NuevoMovimientoNinoForm } from './NuevoMovimientoNinoForm'
import { MovimientoNinoTable } from './MovimientoNinoTable'
import { DollarSign, TrendingDown, TrendingUp, Gift } from 'lucide-react'

interface NinoDetailViewProps {
  nino: Nino
  balance: BalanceNino
  movimientos: MovimientoNino[]
}

export function NinoDetailView({
  nino,
  balance: initialBalance,
  movimientos: initialMovimientos,
}: NinoDetailViewProps) {
  const [balance, setBalance] = useState(initialBalance)
  const [movimientos, setMovimientos] = useState(initialMovimientos)
  const [isLoading, setIsLoading] = useState(false)

  const handleMovimientoAdded = (nuevoMovimiento: MovimientoNino, nuevoBalance: BalanceNino) => {
    setMovimientos([nuevoMovimiento, ...movimientos])
    setBalance(nuevoBalance)
  }

  const handleMovimientoDeleted = async (movimientoId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/niños/${nino.id}/movimientos/${movimientoId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        const data = await response.json()
        setMovimientos(movimientos.filter((m) => m.id !== movimientoId))
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Error deleting movimiento:', error)
      alert('Error al eliminar el movimiento')
    } finally {
      setIsLoading(false)
    }
  }

  const deudaActual = parseFloat(balance.deuda_actual)
  const pagosPadre = parseFloat(balance.pagos_padre)
  const retirosNino = parseFloat(balance.retiros_nino)
  const regalos = parseFloat(balance.regalos)
  const deudaInicial = parseFloat(balance.deuda_inicial)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-[#E4E4E7] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#71717A]">Deuda Inicial</p>
            <DollarSign className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-2xl font-bold text-[#09090B]">
            ${deudaInicial.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E4E4E7] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#71717A]">Pagos del Padre</p>
            <TrendingDown className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-2xl font-bold text-[#10B981]">
            ${pagosPadre.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E4E4E7] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#71717A]">Retiros</p>
            <TrendingUp className="w-4 h-4 text-[#EF4444]" />
          </div>
          <p className="text-2xl font-bold text-[#EF4444]">
            ${retirosNino.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[#E4E4E7] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#71717A]">Regalos</p>
            <Gift className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <p className="text-2xl font-bold text-[#F59E0B]">
            ${regalos.toFixed(2)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg border border-[#2563EB] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#2563EB] font-semibold">Deuda Actual</p>
            <DollarSign className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-2xl font-bold text-[#2563EB]">
            ${deudaActual.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Form and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <NuevoMovimientoNinoForm
            ninoId={nino.id}
            onMovimientoAdded={handleMovimientoAdded}
          />
        </div>

        {/* Movimientos Table */}
        <div className="lg:col-span-2">
          <MovimientoNinoTable
            movimientos={movimientos}
            onDelete={handleMovimientoDeleted}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
