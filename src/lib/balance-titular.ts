import { prisma } from '@/lib/db'
import type { BalanceTitular } from '@/types'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Saldo de un titular: lo que puso inicialmente, menos lo que ha retirado,
 * más lo que ha depositado. Sus retiros también bajan el balance de la cuenta
 * (eso lo calcula lib/balance.ts), pero nunca tocan la deuda de Julie.
 */
export async function calcularBalanceTitular(titularId: number): Promise<BalanceTitular> {
  const titular = await prisma.titular.findUnique({
    where: { id: titularId },
    include: { movimientos: true },
  })

  if (!titular) {
    throw new Error(`Titular con id ${titularId} no encontrado`)
  }

  return construirBalance(titular)
}

export async function obtenerTodosTitulares(): Promise<BalanceTitular[]> {
  const titulares = await prisma.titular.findMany({
    orderBy: { nombre: 'asc' },
    include: { movimientos: true },
  })

  return titulares.map(construirBalance)
}

type TitularConMovimientos = {
  id: number
  nombre: string
  monto_inicial: Decimal
  movimientos: { tipo: string; monto: Decimal }[]
}

function construirBalance(titular: TitularConMovimientos): BalanceTitular {
  let retirado = new Decimal(0)
  let depositado = new Decimal(0)

  for (const mov of titular.movimientos) {
    const monto = new Decimal(mov.monto)
    if (mov.tipo === 'RETIRO_DUENO') {
      retirado = retirado.plus(monto)
    } else if (mov.tipo === 'CREDITO_DUENO') {
      depositado = depositado.plus(monto)
    }
  }

  const inicial = new Decimal(titular.monto_inicial)
  const disponible = inicial.minus(retirado).plus(depositado)

  return {
    titularId: titular.id,
    nombre: titular.nombre,
    monto_inicial: inicial.toFixed(2),
    total_retirado: retirado.toFixed(2),
    total_depositado: depositado.toFixed(2),
    disponible: disponible.toFixed(2),
  }
}
