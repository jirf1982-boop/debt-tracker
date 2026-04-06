# Debt Tracker

App web personal para control de deudas entre dos personas. Registra 8 tipos de movimientos y calcula balances automáticamente.

## Comandos

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run lint` — Linter
- `npm run db:migrate` — Aplicar migraciones
- `npm run db:studio` — UI visual de la base de datos
- `npm run db:generate` — Generar Prisma client

## Tech Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (manual) + Supabase (Postgres) + Prisma + Auth por cookie simple + Vercel

## Arquitectura

### Estructura de carpetas
- `src/app/(app)/` — Rutas protegidas (dashboard, historial, nuevo movimiento)
- `src/app/login/` — Única ruta pública
- `src/app/api/` — API routes: /balance, /movimientos, /config, /auth
- `src/components/dashboard/` — BalanceCard, ResumenReciente
- `src/components/movimientos/` — MovimientosTable, FiltroBar, MovimientoRow
- `src/components/forms/` — NuevoMovimientoForm
- `src/components/layout/` — Sidebar, Header
- `src/components/ui/` — Primitivos shadcn/ui
- `src/lib/` — db.ts (Prisma), balance.ts (cálculos), auth.ts (sesión), utils.ts

### Flujo de datos
Server Components hacen fetch directo a Postgres vía Prisma.
El formulario de nuevo movimiento es Client Component — usa react-hook-form + Zod,
POST a `/api/movimientos`, y llama `router.refresh()` al éxito.

### Patrones clave
- Server Components por defecto. "use client" solo en formularios e interacciones
- Todos los cálculos de balance en `src/lib/balance.ts` — nunca inline en componentes
- Auth: cookie `session` firmada con COOKIE_SECRET. Middleware en `middleware.ts` protege `/(app)/*`
- Montos: siempre Decimal en Prisma, nunca float. Formatear con `formatCurrency()` de utils.ts

## Tipos de Movimiento

```typescript
enum TipoMovimiento {
  RETIRO_PERSONAL  // − balance, + deuda personal
  RETIRO_NEGOCIO   // − balance, + deuda negocio
  ABONO_PERSONAL   // + balance, − deuda personal
  ABONO_NEGOCIO    // + balance, − deuda negocio
  FEE_BANCARIO     // − balance (no afecta deuda)
  ABONO_INTERES    // + balance (no afecta deuda)
  RETIRO_DUENO     // − balance (no afecta deuda)
  CREDITO_DUENO    // + balance (no afecta deuda)
}
```

## Sistema de Diseño

### Colores
- Primary: `#2563EB` (azul — botones, accents)
- Background: `#FAFAFA`
- Surface: `#FFFFFF` (tarjetas)
- Text: `#09090B`
- Muted: `#71717A`
- Border: `#E4E4E7`
- Danger: `#DC2626` (retiros, fees)
- Success: `#16A34A` (abonos, créditos)
- Sidebar: `#18181B`

### Tipografía
- Fuente: IBM Plex Sans (headings y body), IBM Plex Mono (montos)
- Body: 16px / 400
- Labels: 14px / 500
- Montos grandes: 28px / 700

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Supabase Postgres connection string |
| `ADMIN_PASSWORD` | Contraseña de acceso a la app |
| `COOKIE_SECRET` | Secreto para firmar cookies (32 chars) |

## Reglas No Negociables

1. **Nunca usar float para montos.** Usar Decimal en Prisma y string en la API.
2. **Todos los cálculos de balance en `lib/balance.ts`.** Nunca calcular inline.
3. **Validar con Zod antes de tocar la base de datos.**
4. **TypeScript strict mode activado.** Cero `any` types.
5. **Server Components por defecto.** Solo `"use client"` con interactividad real.
6. **Un componente por archivo. Máximo 300 líneas.**
7. **No commitear `.env.local`.**
8. **Diseño mobile-first.**
