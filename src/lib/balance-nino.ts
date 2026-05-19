import { prisma } from '@/lib/db'
import { BalanceNino, TipoMovimientoNino } from '@/types'
import { Decimal } from '@prisma/client/runtime/library'

export async function calcularBalanceNino(ninoId: number): Promise<BalanceNino> {
  console.log('[calcularBalanceNino] Starting for ninoId:', ninoId)
  const nino = await prisma.nino.findUnique({
    where: { id: ninoId },
    include: { movimientos: true },
  })

  if (!nino) {
    throw new Error(`Child with id ${ninoId} not found`)
  }

  let pagosPadre = new Decimal(0)
  let retirosNino = new Decimal(0)
  let regalos = new Decimal(0)

  for (const mov of nino.movimientos) {
    const monto = new Decimal(mov.monto)
    switch (mov.tipo) {
      case 'PAGO_PADRE':
        pagosPadre = pagosPadre.plus(monto)
        break
      case 'RETIRO_NINO':
        retirosNino = retirosNino.plus(monto)
        break
      case 'REGALO_DINERO':
        regalos = regalos.plus(monto)
        break
    }
  }

  const deudaInicial = new Decimal(nino.deuda_inicial)
  const deudaActual = deudaInicial.plus(retirosNino).plus(regalos).minus(pagosPadre)

  return {
    ninoId: nino.id,
    nombre: nino.nombre,
    deuda_inicial: deudaInicial.toFixed(2),
    pagos_padre: pagosPadre.toFixed(2),
    retiros_nino: retirosNino.toFixed(2),
    regalos: regalos.toFixed(2),
    deuda_actual: deudaActual.toFixed(2),
  }
}

export async function obtenerTodosNinos(): Promise<BalanceNino[]> {
  console.log('[obtenerTodosNinos] FUNCTION START')
  try {
    console.log('[obtenerTodosNinos] Querying all ninos...')
    const ninos = await prisma.nino.findMany({
      orderBy: { nombre: 'asc' },
    })
    console.log('[obtenerTodosNinos] Found', ninos.length, 'ninos')

    const balances = await Promise.all(
      ninos.map(async (n) => {
        console.log('[obtenerTodosNinos] Calculating balance for', n.nombre, '(id:', n.id, ')')
        return calcularBalanceNino(n.id)
      })
    )
    console.log('[obtenerTodosNinos] Calculated all balances')
    return balances
  } catch (error) {
    console.error('[obtenerTodosNinos] Caught error:', error instanceof Error ? error.message : error)
    throw error
  }
}
