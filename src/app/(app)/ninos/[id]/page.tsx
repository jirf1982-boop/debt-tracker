import { prisma } from '@/lib/db'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { NinoDetailView } from '@/components/ninos/NinoDetailView'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NinoDetailPage({ params }: PageProps) {
  const { id } = await params
  const ninoId = parseInt(id)

  if (isNaN(ninoId)) {
    notFound()
  }

  try {
    const nino = await prisma.nino.findUnique({
      where: { id: ninoId },
      include: {
        movimientos: {
          orderBy: { fecha: 'desc' },
        },
      },
    })

    if (!nino) {
      notFound()
    }

    const balance = await calcularBalanceNino(ninoId)
    const ninoData = {
      id: nino.id,
      nombre: nino.nombre,
      deuda_inicial: nino.deuda_inicial.toString(),
      created_at: nino.created_at.toISOString(),
      updated_at: nino.updated_at.toISOString(),
      movimientos: nino.movimientos.map((m) => ({
        id: m.id,
        ninoId: m.ninoId,
        tipo: m.tipo,
        monto: m.monto.toString(),
        fecha: m.fecha.toISOString(),
        nota: m.nota,
        created_at: m.created_at.toISOString(),
      })),
    }

    return (
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#09090B] mb-2">
              {nino.nombre}
            </h1>
            <p className="text-[#71717A]">Detalles y transacciones</p>
          </div>

          <NinoDetailView
            nino={ninoData}
            balance={balance}
            movimientos={ninoData.movimientos}
          />
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error loading child details:', error)
    notFound()
  }
}
