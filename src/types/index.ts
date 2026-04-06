export type TipoMovimiento =
  | 'RETIRO_PERSONAL'
  | 'RETIRO_NEGOCIO'
  | 'ABONO_PERSONAL'
  | 'ABONO_NEGOCIO'
  | 'FEE_BANCARIO'
  | 'ABONO_INTERES'
  | 'RETIRO_DUENO'
  | 'CREDITO_DUENO'

export interface Movimiento {
  id: number
  tipo: TipoMovimiento
  monto: string
  fecha: string
  nota: string | null
  created_at: string
}

export interface BalanceData {
  balance_inicial: string
  balance_cuenta: string
  deuda_personal: string
  deuda_negocio: string
  deuda_total: string
  nombre_acreedor: string
  moneda: string
}

export interface MovimientosResponse {
  data: Movimiento[]
  total: number
  page: number
  totalPages: number
}

export interface ConfigData {
  id: number
  balance_inicial: string
  nombre_acreedor: string
  moneda: string
}

export const TIPO_LABELS: Record<TipoMovimiento, string> = {
  RETIRO_PERSONAL: 'Retiro Personal',
  RETIRO_NEGOCIO: 'Retiro Negocio',
  ABONO_PERSONAL: 'Abono Personal',
  ABONO_NEGOCIO: 'Abono Negocio',
  FEE_BANCARIO: 'Fee Bancario',
  ABONO_INTERES: 'Abono Interés',
  RETIRO_DUENO: 'Retiro Dueño',
  CREDITO_DUENO: 'Crédito Dueño',
}

export const TIPOS_NEGATIVOS: TipoMovimiento[] = [
  'RETIRO_PERSONAL',
  'RETIRO_NEGOCIO',
  'FEE_BANCARIO',
  'RETIRO_DUENO',
]

export const TIPOS_POSITIVOS: TipoMovimiento[] = [
  'ABONO_PERSONAL',
  'ABONO_NEGOCIO',
  'ABONO_INTERES',
  'CREDITO_DUENO',
]
