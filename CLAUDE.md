## Approach
- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read unless the file may have changed.
- Skip files over 100KB unless explicitly required.
- Suggest running /cost when a session is running long to monitor cache ratio.
- Recommend starting a new session when switching to an unrelated task.
- Test your code before declaring done.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.

# Debt Tracker

App web personal de Julie (única usuaria). Controla dos cosas:
1. Su deuda con un acreedor (incluye préstamo de 100K con intereses).
2. El dinero/deuda de sus hijos (feature "niños").

## Comandos

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción (`prisma generate && next build`)
- `npm run lint` — Linter
- `npm run db:migrate` — Aplicar migraciones (¡leer ADVERTENCIAS abajo!)
- `npm run db:studio` — UI visual de la base de datos
- `npm run db:seed` — Seed (prisma/seed.ts)

## Tech Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (manual)
+ Supabase Postgres (plan FREE) + Prisma 5 + Auth por cookie simple + Vercel.

Next.js 16 difiere de lo que los modelos conocen: leer
`node_modules/next/dist/docs/` antes de escribir código que use sus APIs.
Prisma está anclado a v5 por compatibilidad con Vercel — no subir de versión
a la ligera (el historial de git muestra ~20 commits arreglando deploys).

## Arquitectura

### Rutas (src/app)
- `(app)/` — protegidas: dashboard, movimientos, nuevo, ninos, prestamo, configuracion
- `login/` — única ruta pública
- `api/` — auth (login/logout), balance, config, movimientos(/[id]),
  ninos(/[id]/movimientos/[movId]), health (sin auth), debug

### Componentes (src/components)
dashboard/ (BalanceCard, ResumenReciente), movimientos/, ninos/, prestamo/
(PrestamoView), forms/ (NuevoMovimientoForm, ConfigForm), layout/ (Sidebar,
Header), ui/ (primitivos shadcn)

### Lib (src/lib)
- `db.ts` — Prisma client
- `balance.ts` — cálculos de balance/deuda principal (OJO: usa Number(),
  viola la regla de Decimal; pendiente de arreglar)
- `balance-nino.ts` — cálculos de niños (este SÍ usa Decimal — es el patrón
  a seguir)
- `auth.ts` — sesión con cookie firmada (COOKIE_SECRET)
- `utils.ts` — formatCurrency() y helpers

### Flujo de datos
Server Components hacen fetch directo a Postgres vía Prisma. Formularios son
Client Components: react-hook-form + Zod, POST al API, `router.refresh()`.

## Modelos (prisma/schema.prisma)

- `Config` — balance_inicial, nombre_acreedor, moneda
- `Movimiento` — tipo (enum TipoMovimiento, 9 valores), monto Decimal, fecha, nota
- `Nino` / `MovimientoNino` — tipo (PAGO_PADRE, RETIRO_NINO, REGALO_DINERO)
- `Titular` — personas dueñas de una parte del dinero de la cuenta (mamá,
  hermanos): nombre, monto_inicial. `Movimiento.titularId` es opcional y solo
  aplica a RETIRO_DUENO / CREDITO_DUENO. Un retiro de titular baja el balance
  de la cuenta Y se descuenta de esa persona con un solo registro; nunca toca
  la deuda de Julie. Saldo en `lib/balance-titular.ts` (usa Decimal).
  Deliberadamente NO se agregaron valores al enum TipoMovimiento: con dos
  hermanos, un `RETIRO_HERMANO` no distinguiría quién sacó qué.

```
enum TipoMovimiento {
  RETIRO_PERSONAL        // − balance, + deuda personal
  RETIRO_NEGOCIO         // − balance, + deuda negocio
  ABONO_PERSONAL         // + balance, − deuda personal
  ABONO_NEGOCIO          // + balance, − deuda negocio
  FEE_BANCARIO           // − balance (no afecta deuda)
  ABONO_INTERES          // + balance (no afecta deuda)
  RETIRO_DUENO           // − balance (no afecta deuda)
  CREDITO_DUENO          // + balance (no afecta deuda)
  INTERES_PRESTAMO_100K  // + balance, − deuda personal
}
```

## ADVERTENCIAS de base de datos

1. La base es Supabase FREE: se pausa tras ~1 semana sin uso y NO tiene
   backups automáticos. Hacer respaldo con `node scripts/backup-datos.cjs`
   antes de cualquier cambio de schema. Los respaldos van a `backups/`
   (gitignoreado — contienen datos reales).
2. El enum INTERES_PRESTAMO_100K se aplicó a mano en la base. Existe una
   migración baseline (20260710..._add_interes_prestamo_100k) con
   IF NOT EXISTS; si `migrate deploy`/`migrate dev` la marca pendiente,
   es seguro aplicarla. NUNCA aceptar un reset de base propuesto por
   `prisma migrate dev` sin respaldo previo.
3. Prisma CLI no lee `.env.local` automáticamente. Para comandos de
   migración: `set -a; source .env.local; set +a; npx prisma ...`
4. La DATABASE_URL usa el pooler (puerto 6543, pgbouncer) — necesario para
   Vercel, pero los comandos `prisma migrate` fallan con "prepared statement
   already exists". Para migraciones, cambiar a puerto 5432 y quitar
   `?pgbouncer=true`:
   `DB="${DATABASE_URL/:6543/:5432}"; DB="${DB/\?pgbouncer=true/}"; DATABASE_URL="$DB" npx prisma migrate ...`

## Variables de Entorno (.env.local, nunca commitear)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Supabase Postgres (pooler, puerto 6543) |
| `ADMIN_PASSWORD` | Contraseña de acceso a la app |
| `COOKIE_SECRET` | Secreto para firmar cookies (32 chars) |

## Sistema de Diseño

Colores: Primary #2563EB, Background #FAFAFA, Surface #FFFFFF, Text #09090B,
Muted #71717A, Border #E4E4E7, Danger #DC2626 (retiros/fees), Success
#16A34A (abonos/créditos), Sidebar #18181B.
Tipografía: IBM Plex Sans (texto), IBM Plex Mono (montos). Body 16px/400,
labels 14px/500, montos grandes 28px/700.

## Reglas No Negociables

1. **Nunca usar float para montos.** Decimal en Prisma, string en la API.
   Patrón correcto: `balance-nino.ts`. (`balance.ts` aún lo viola.)
2. **Cálculos de balance solo en `lib/balance.ts` / `lib/balance-nino.ts`.**
3. **Validar con Zod antes de tocar la base de datos.**
4. **TypeScript strict. Cero `any`.**
5. **Server Components por defecto.** `"use client"` solo con interactividad.
6. **Un componente por archivo. Máximo 300 líneas.**
7. **No commitear `.env*` ni `backups/`.**
8. **Diseño mobile-first.**
9. **Antes de implementar ideas nuevas, pasar por la skill
   `abogado-del-diablo`** (.claude/skills/).
