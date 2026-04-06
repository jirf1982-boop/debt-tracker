import { NuevoMovimientoForm } from '@/components/forms/NuevoMovimientoForm'

export default function NuevoPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#71717A]">
        Registra un nuevo movimiento. El balance se actualizará automáticamente.
      </p>
      <NuevoMovimientoForm />
    </div>
  )
}
