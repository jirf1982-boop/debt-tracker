import { TitularesView } from '@/components/titulares/TitularesView'
import { obtenerTodosTitulares } from '@/lib/balance-titular'

export const dynamic = 'force-dynamic'

export default async function TitularesPage() {
  const titulares = await obtenerTodosTitulares()
  return <TitularesView titulares={titulares} />
}
