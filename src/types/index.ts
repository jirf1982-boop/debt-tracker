export type TipoMovimiento =
  | 'RETIRO_PERSONAL'
  | 'RETIRO_NEGOCIO'
  | 'ABONO_PERSONAL'
  | 'ABONO_NEGOCIO'
  | 'FEE_BANCARIO'
  | 'ABONO_INTERES'
  | 'RETIRO_DUENO'
  | 'CREDITO_DUENO'
  | 'INTERES_PRESTAMO_100K'

export interface Movimiento {
  id: number
  tipo: TipoMovimiento
  monto: string
  fecha: string
  nota: string | null
  created_at: string
  titularId: number | null
  titular_nombre?: string | null
}

export interface BalanceData {
  balance_inicial: string
  balance_cuenta: string
  deuda_personal: string
  deuda_negocio: string
  deuda_total: string
  nombre_acreedor: string
  moneda: string
  total_retiro_dueno: string
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
  RETIRO_DUENO: 'Retiro de titular',
  CREDITO_DUENO: 'Depósito de titular',
  INTERES_PRESTAMO_100K: 'Interés Préstamo 100K',
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
  'INTERES_PRESTAMO_100K',
]

// Titulares — personas dueñas de una parte del dinero de la cuenta
export interface Titular {
  id: number
  nombre: string
  monto_inicial: string
  created_at: string
  updated_at: string
}

export interface BalanceTitular {
  titularId: number
  nombre: string
  monto_inicial: string
  total_retirado: string
  total_depositado: string
  disponible: string
}

/** Tipos de movimiento que pueden atribuirse a un titular. */
export const TIPOS_DE_TITULAR: TipoMovimiento[] = ['RETIRO_DUENO', 'CREDITO_DUENO']

// Niños (Children) Debt Tracking
export type TipoMovimientoNino = 'PAGO_PADRE' | 'RETIRO_NINO' | 'REGALO_DINERO'

export interface Nino {
  id: number
  nombre: string
  deuda_inicial: string
  created_at: string
  updated_at: string
}

export interface MovimientoNino {
  id: number
  ninoId: number
  tipo: TipoMovimientoNino
  monto: string
  fecha: string
  nota: string | null
  created_at: string
}

export interface BalanceNino {
  ninoId: number
  nombre: string
  deuda_inicial: string
  pagos_padre: string
  retiros_nino: string
  regalos: string
  deuda_actual: string
}

export const TIPO_MOVIMIENTO_NINO_LABELS: Record<TipoMovimientoNino, string> = {
  PAGO_PADRE: 'Pago del Padre',
  RETIRO_NINO: 'Retiro del Niño',
  REGALO_DINERO: 'Regalo/Dinero Adicional',
}
