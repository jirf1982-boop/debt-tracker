-- Baseline: este valor ya existe en la base de producción (aplicado a mano
-- en abril 2026). IF NOT EXISTS hace la migración idempotente y segura.
ALTER TYPE "TipoMovimiento" ADD VALUE IF NOT EXISTS 'INTERES_PRESTAMO_100K';
