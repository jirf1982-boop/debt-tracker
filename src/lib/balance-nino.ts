import { prisma } from '@/lib/db'
import { BalanceNino, EFECTO_MOVIMIENTO_NINO } from '@/types'
import { Decimal } from '@prisma/client/runtime/library'

export async function calcularBalanceNino(ninoId: number): Promise<BalanceNino> {
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

  // El efecto sobre la deuda sale de EFECTO_MOVIMIENTO_NINO, no de este
  // switch: así la pantalla y el cálculo nunca pueden discrepar.
  let deudaActual = new Decimal(nino.deuda_inicial)

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

    const { signo } = EFECTO_MOVIMIENTO_NINO[mov.tipo]
    deudaActual = deudaActual.plus(monto.times(signo))
  }

  const deudaInicial = new Decimal(nino.deuda_inicial)

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
  const ninos = await prisma.nino.findMany({ orderBy: { nombre: 'asc' } })
  return Promise.all(ninos.map((n) => calcularBalanceNino(n.id)))
}
