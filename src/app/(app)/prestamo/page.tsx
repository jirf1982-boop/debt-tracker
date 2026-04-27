import { prisma } from '@/lib/db'
import { PrestamoView } from '@/components/prestamo/PrestamoView'

export const dynamic = 'force-dynamic'

export default async function PrestamoPage() {
  const [pagos, config] = await Promise.all([
    prisma.movimiento.findMany({
      where: { tipo: 'INTERES_PRESTAMO_100K' },
      orderBy: [{ fecha: 'desc' }, { created_at: 'desc' }],
    }),
    prisma.config.findFirst(),
  ])

  const moneda = config?.moneda ?? 'MXN'
  const totalPagado = pagos.reduce((sum, m) => sum + Number(m.monto), 0)

  const pagosFormatted = pagos.map((m) => ({
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
        <h1 className="text-xl font-semibold text-[#09090B]">Préstamo $100,000</h1>
        <p className="text-sm text-[#71717A] mt-0.5">
          Los abonos de interés se descuentan de la deuda total y se suman al balance de la cuenta
        </p>
      </div>
      <PrestamoView pagos={pagosFormatted} totalPagado={totalPagado} moneda={moneda} />
    </div>
  )
}
