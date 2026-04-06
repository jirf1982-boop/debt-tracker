import { prisma } from '@/lib/db'
import { calcularBalance } from '@/lib/balance'
import { BalanceCard } from '@/components/dashboard/BalanceCard'
import { ResumenReciente } from '@/components/dashboard/ResumenReciente'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [balance, movimientos] = await Promise.all([
    calcularBalance(),
    prisma.movimiento.findMany({
      orderBy: [{ fecha: 'desc' }, { created_at: 'desc' }],
      take: 5,
    }),
  ])

  const movimientosFormatted = movimientos.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    monto: m.monto.toString(),
    fecha: m.fecha.toISOString(),
    nota: m.nota,
    created_at: m.created_at.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-[#71717A] mb-1">
          {balance.nombre_acreedor}
        </h2>
        <p className="text-xs text-[#71717A]">
          Balance inicial: {new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: balance.moneda,
          }).format(parseFloat(balance.balance_inicial))}
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <BalanceCard
          titulo="Deuda Personal"
          monto={balance.deuda_personal}
          moneda={balance.moneda}
          tipo="personal"
        />
        <BalanceCard
          titulo="Deuda Negocio"
          monto={balance.deuda_negocio}
          moneda={balance.moneda}
          tipo="negocio"
        />
        <BalanceCard
          titulo="Deuda Total"
          monto={balance.deuda_total}
          moneda={balance.moneda}
          tipo="total"
        />
        <BalanceCard
          titulo="Balance de la Cuenta"
          monto={balance.balance_cuenta}
          moneda={balance.moneda}
          tipo="balance"
        />
      </div>

      {/* Resumen reciente */}
      <ResumenReciente movimientos={movimientosFormatted} moneda={balance.moneda} />
    </div>
  )
}
