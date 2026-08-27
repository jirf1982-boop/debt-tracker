import { NuevoMovimientoForm } from '@/components/forms/NuevoMovimientoForm'
import { obtenerTodosTitulares } from '@/lib/balance-titular'

export const dynamic = 'force-dynamic'

export default async function NuevoPage() {
  const titulares = await obtenerTodosTitulares()

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#71717A]">
        Registra un nuevo movimiento. El balance se actualizará automáticamente.
      </p>
      <NuevoMovimientoForm titulares={titulares} />
    </div>
  )
}
