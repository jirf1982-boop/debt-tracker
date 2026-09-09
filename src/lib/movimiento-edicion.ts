import type { TipoMovimiento } from '@/types'
import { TIPOS_DE_TITULAR } from '@/types'

export interface CambiosMovimiento {
  tipo?: TipoMovimiento
  monto?: number
  fecha?: string
  nota?: string | null
  titularId?: number | null
}

export interface MovimientoActual {
  tipo: TipoMovimiento
  titularId: number | null
}

/**
 * Decide a qué titular queda atribuido un movimiento después de editarlo.
 *
 * Regla: solo RETIRO_DUENO y CREDITO_DUENO pertenecen a una persona. Si la
 * edición cambia el tipo a uno que no es de titular, se suelta la persona —
 * dejarla pegada guardaría una atribución que ya no corresponde.
 *
 * Devuelve `undefined` cuando no hay que tocar la columna.
 */
export function resolverTitular(
  actual: MovimientoActual,
  cambios: CambiosMovimiento
): number | null | undefined {
  const tipoFinal = cambios.tipo ?? actual.tipo
  const permiteTitular = (TIPOS_DE_TITULAR as readonly string[]).includes(tipoFinal)

  if (!permiteTitular) {
    return actual.titularId === null ? undefined : null
  }

  return cambios.titularId
}
