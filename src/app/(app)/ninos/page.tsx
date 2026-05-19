import { obtenerTodosNinos } from '@/lib/balance-nino'
import { NinosListView } from '@/components/ninos/NinosListView'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function NinosPage() {
  try {
    console.log('[NinosPage] Starting page render...')
    console.log('[NinosPage] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
    console.log('[NinosPage] About to call obtenerTodosNinos')
    const ninos = await obtenerTodosNinos()
    console.log('[NinosPage] obtenerTodosNinos returned:', ninos?.length)

    if (!ninos || ninos.length === 0) {
      return (
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#09090B] mb-2">Mis Hijos</h1>
              <p className="text-[#71717A]">Control de deudas y pagos</p>
            </div>
            <div className="text-center">
              <p className="text-[#71717A]">No hay hijos registrados</p>
            </div>
          </div>
        </main>
      )
    }

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
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('[NinosPage] FATAL ERROR:', errorMsg)
    console.error('[NinosPage] Stack:', errorStack)
    console.error('[NinosPage] Full error object:', JSON.stringify(error))
    throw error
  }
}
