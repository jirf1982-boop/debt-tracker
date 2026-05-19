-- CreateEnum
CREATE TYPE "TipoMovimientoNino" AS ENUM ('PAGO_PADRE', 'RETIRO_NINO', 'REGALO_DINERO');

-- CreateTable
CREATE TABLE "Nino" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "deuda_inicial" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoNino" (
    "id" SERIAL NOT NULL,
    "ninoId" INTEGER NOT NULL,
    "tipo" "TipoMovimientoNino" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "nota" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoNino_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Nino_nombre_idx" ON "Nino"("nombre");

-- CreateIndex
CREATE INDEX "MovimientoNino_ninoId_idx" ON "MovimientoNino"("ninoId");

-- CreateIndex
CREATE INDEX "MovimientoNino_fecha_idx" ON "MovimientoNino"("fecha");

-- CreateIndex
CREATE INDEX "MovimientoNino_tipo_idx" ON "MovimientoNino"("tipo");

-- AddForeignKey
ALTER TABLE "MovimientoNino" ADD CONSTRAINT "MovimientoNino_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
