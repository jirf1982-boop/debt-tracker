-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('RETIRO_PERSONAL', 'RETIRO_NEGOCIO', 'ABONO_PERSONAL', 'ABONO_NEGOCIO', 'FEE_BANCARIO', 'ABONO_INTERES', 'RETIRO_DUENO', 'CREDITO_DUENO');

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "balance_inicial" DECIMAL(12,2) NOT NULL,
    "nombre_acreedor" TEXT NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "nota" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Movimiento_fecha_idx" ON "Movimiento"("fecha");

-- CreateIndex
CREATE INDEX "Movimiento_tipo_idx" ON "Movimiento"("tipo");
