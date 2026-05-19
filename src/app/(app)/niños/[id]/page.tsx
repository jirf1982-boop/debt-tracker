import { prisma } from '@/lib/prisma'
import { calcularBalanceNino } from '@/lib/balance-nino'
import { NinoDetailView } from '@/components/niños/NinoDetailView'
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
            nino={nino}
            balance={balance}
            movimientos={nino.movimientos}
          />
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error loading child details:', error)
    notFound()
  }
}
