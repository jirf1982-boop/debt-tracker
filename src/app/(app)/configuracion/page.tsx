import { ConfigForm } from '@/components/forms/ConfigForm'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const config = await prisma.config.findFirst()

  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-sm text-[#71717A]">
        Define el balance inicial de la cuenta y el nombre del acreedor.
      </p>
      <ConfigForm
        initialData={
          config
            ? {
                balance_inicial: config.balance_inicial.toString(),
                nombre_acreedor: config.nombre_acreedor,
                moneda: config.moneda as 'MXN' | 'USD',
              }
            : undefined
        }
      />
    </div>
  )
}
