import { prisma } from './db'
import type { BalanceData } from '@/types'

export async function calcularBalance(): Promise<BalanceData> {
  const [config, movimientos] = await Promise.all([
    prisma.config.findFirst(),
    prisma.movimiento.findMany(),
  ])

  if (!config) {
    return {
      balance_inicial: '0.00',
      balance_cuenta: '0.00',
      deuda_personal: '0.00',
      deuda_negocio: '0.00',
      deuda_total: '0.00',
      nombre_acreedor: 'Sin configurar',
      moneda: 'MXN',
    }
  }

  let sumPositivos = 0
  let sumNegativos = 0
  let sumRetiroPersonal = 0
  let sumAbonoPersonal = 0
  let sumRetiroNegocio = 0
  let sumAbonoNegocio = 0

  for (const m of movimientos) {
    const monto = Number(m.monto)
    switch (m.tipo) {
      case 'ABONO_PERSONAL':
        sumPositivos += monto
        sumAbonoPersonal += monto
        break
      case 'ABONO_NEGOCIO':
        sumPositivos += monto
        sumAbonoNegocio += monto
        break
      case 'ABONO_INTERES':
        sumPositivos += monto
        break
      case 'CREDITO_DUENO':
        sumPositivos += monto
        break
      case 'RETIRO_PERSONAL':
        sumNegativos += monto
        sumRetiroPersonal += monto
        break
      case 'RETIRO_NEGOCIO':
        sumNegativos += monto
        sumRetiroNegocio += monto
        break
      case 'FEE_BANCARIO':
        sumNegativos += monto
        break
      case 'RETIRO_DUENO':
        sumNegativos += monto
        break
    }
  }

  const balanceInicial = Number(config.balance_inicial)
  const balanceCuenta = balanceInicial + sumPositivos - sumNegativos
  const deudaPersonal = Math.max(0, sumRetiroPersonal - sumAbonoPersonal)
  const deudaNegocio = Math.max(0, sumRetiroNegocio - sumAbonoNegocio)
  const deudaTotal = deudaPersonal + deudaNegocio

  return {
    balance_inicial: balanceInicial.toFixed(2),
    balance_cuenta: balanceCuenta.toFixed(2),
    deuda_personal: deudaPersonal.toFixed(2),
    deuda_negocio: deudaNegocio.toFixed(2),
    deuda_total: deudaTotal.toFixed(2),
    nombre_acreedor: config.nombre_acreedor,
    moneda: config.moneda,
  }
}
