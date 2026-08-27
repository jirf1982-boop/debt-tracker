-- AlterTable
ALTER TABLE "Movimiento" ADD COLUMN     "titularId" INTEGER;

-- CreateTable
CREATE TABLE "Titular" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "monto_inicial" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Titular_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Titular_nombre_idx" ON "Titular"("nombre");

-- CreateIndex
CREATE INDEX "Movimiento_titularId_idx" ON "Movimiento"("titularId");

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "Titular"("id") ON DELETE SET NULL ON UPDATE CASCADE;
