import { obtenerTodosNinos } from '@/lib/balance-nino'
import { NinosListView } from '@/components/niños/NinosListView'

export const dynamic = 'force-dynamic'

export default async function NinosPage() {
  const ninos = await obtenerTodosNinos()

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#09090B] mb-2">Mis Hijos</h1>
          <p className="text-[#71717A]">Control de deudas y pagos</p>
        </div>

        <NinosListView ninos={ninos} />
      </div>
    </main>
  )
}
