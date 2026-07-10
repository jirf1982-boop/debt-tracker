---
name: chequeo-seguridad
description: Chequeo de seguridad completo del proyecto debt-tracker. Usar cuando el usuario pida revisar seguridad, auditar la app, verificar secretos expuestos, revisar antes de un deploy importante, o diga frases como "revisa la seguridad", "está segura la app", "audita el código", "chequeo de seguridad", "hay algo expuesto".
---

# Chequeo de seguridad — debt-tracker

App Next.js 16 (App Router, Turbopack) + Prisma 5 + Supabase Postgres, desplegada en Vercel
(proyecto `debt-tracker`, dominio `debt-tracker-inky.vercel.app`, repo
`github.com/jirf1982-boop/debt-tracker`). Un solo usuario (Julie). Auth por contraseña única
(`ADMIN_PASSWORD`) con cookie de sesión firmada HMAC-SHA256 (`COOKIE_SECRET`).
Los datos sensibles son: deudas personales, movimientos de dinero y balances de los hijos.

## Mapa de lo delicado (revisar SIEMPRE estos archivos)

| Qué | Dónde |
|---|---|
| Firma/verificación de sesión | `src/lib/auth.ts` (nota: fallback `'fallback-secret-change-me'` si falta `COOKIE_SECRET`) |
| Gate de autenticación global | `src/middleware.ts` (matcher cubre todo menos estáticos; excepciones: `/api/auth/*` y `/api/health`) |
| Login | `src/app/api/auth/login/route.ts` (comparación de password, seteo de cookie) |
| Cliente Prisma / conexión BD | `src/lib/db.ts` |
| Endpoints con escritura a BD | `src/app/api/movimientos/route.ts`, `src/app/api/movimientos/[id]/route.ts`, `src/app/api/ninos/route.ts`, `src/app/api/ninos/[id]/movimientos/route.ts`, `src/app/api/ninos/[id]/movimientos/[movId]/route.ts`, `src/app/api/config/route.ts` |
| Secretos locales | `.env.local`, `.env.production`, `.vercelenv` (¡históricamente committeado!) |
| Archivos sueltos con riesgo | `server.log`, `check-db.js`, `test-ninos*.{js,ts}`, `delete-ninos.ts`, `src/app/api/debug/ninos.ts` |

## Orden del chequeo

### 1. Secretos expuestos o committeados

```bash
cd /Users/julie/Desktop/debt-tracker
# ¿Qué archivos sensibles están trackeados en git?
git ls-files | grep -iE "\.env|vercelenv|secret|\.log|\.pem"
# ¿Hay credenciales en archivos trackeados?
git grep -lE "postgresql://|PASSWORD|SECRET" -- ':!node_modules' ':!package-lock.json'
# ¿Quedaron secretos en el HISTORIAL aunque ya no estén trackeados?
git log --all --oneline -- .vercelenv .env .env.local .env.production
```

Hallazgo conocido: `.vercelenv` estuvo committeado con el password de Postgres en texto plano.
Si sigue en el historial de GitHub, el password está expuesto → severidad ALTA, el arreglo es
rotar el password en Supabase (Project Settings → Database → Reset password), actualizar
`DATABASE_URL`/`DIRECT_URL` en Vercel (`vercel env rm` + `vercel env add`, ambiente production,
puerto 6543 con `?pgbouncer=true`) y quitar el archivo con `git rm --cached .vercelenv`.

Revisar también que `server.log` (trackeado) no contenga credenciales:
`grep -iE "password|secret|postgres" server.log`.

### 2. Validación de lo que entra por cada endpoint

Zod está en `package.json` pero verificar que de verdad se use en cada `route.ts` con POST/PUT/DELETE:

```bash
grep -rL "zod" src/app/api --include="route.ts" | xargs grep -l "POST\|PUT\|DELETE"
```

Patrón conocido de fallo en este repo: `src/app/api/ninos/[id]/movimientos/route.ts` hace
`new Decimal(monto)` y `new Date(fecha)` directo del body sin validar — un `monto` no numérico
o `tipo` fuera del enum revienta con 500, y un `monto` negativo corrompe los balances.
Revisar que `tipo` se valide contra el enum `TipoMovimientoNino` de `prisma/schema.prisma`,
que `monto` sea decimal positivo, y que `parseInt(id)` maneje `NaN`.

### 3. Quién puede tocar qué dato

- El gate es `src/middleware.ts`. Verificar que su `matcher` siga cubriendo `/api/*` y que las
  únicas excepciones sean `/api/auth/*` y `/api/health`. Cualquier ruta nueva bajo
  `src/app/api/` queda protegida SOLO si el matcher no cambió — probarlo sin cookie:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" https://debt-tracker-inky.vercel.app/api/ninos
  # Debe dar 307 (redirect a /login) o 401 — NUNCA 200
  ```
- `/api/health` es público por diseño: verificar que NUNCA devuelva el connection string ni
  detalles internos (hoy devuelve `error.message` de Prisma en fallos — eso ya filtra el host
  de la BD; considerar devolver solo `"db":"disconnected"` sin el mensaje).
- Rutas dinámicas (`[id]`, `[movId]`): como hay un solo usuario no hay escalación horizontal,
  pero verificar que un `id` inexistente dé 404 y no 500.

### 4. Inyección

- Prisma parametriza todo; el riesgo real es `$queryRaw`/`$executeRaw` con template dinámico:
  ```bash
  grep -rn "queryRaw\|executeRaw" src/
  ```
- XSS: buscar `dangerouslySetInnerHTML` en `src/components/` (el campo `nota` viene del usuario
  y se renderiza en tablas):
  ```bash
  grep -rn "dangerouslySetInnerHTML" src/
  ```

### 5. Datos sensibles en logs o respuestas

- `src/middleware.ts` tiene `console.log` de cada pathname y estado de auth — ruido aceptable,
  pero verificar que nunca loguee el valor de la cookie ni el secret.
- `src/app/api/debug/ninos.ts` loguea balances completos. OJO: al no llamarse `route.ts` NO es
  un endpoint expuesto (dead code) — pero si alguien lo renombra a `route.ts` queda público vía
  middleware... no: el middleware lo cubriría. El riesgo real es el `console.log` de datos. Sugerir borrarlo.
- Buscar respuestas que devuelvan `error.message` crudo al cliente:
  ```bash
  grep -rn "error.message\|String(error)" src/app/api/
  ```

### 6. Dependencias con hoyos conocidos

```bash
npm audit --omit=dev
```

Estado al escribir esto: `next` con vulnerabilidad HIGH (rango 9.3.4-canary.0 – 16.3.0-canary.5)
y `postcss` MODERATE. El fix es subir `next` a una versión parcheada y correr `npm run build`
para confirmar que nada se rompe antes de pushear (el push a `main` despliega automático en Vercel).

## Regla de oro

Cada hallazgo lleva: **archivo:línea**, **severidad** (CRÍTICA/ALTA/MEDIA/BAJA) y **cómo se
explota en una frase**. Si no puedes decir cómo se explota, es opinión, no hallazgo — va en
una sección aparte de "observaciones" o no va.

Antes de reportar, intenta tumbar cada hallazgo propio: ¿el middleware ya lo bloquea? ¿el
archivo es dead code? ¿el repo es privado y eso baja la severidad (pero no la elimina)?
Solo sobreviven los que resisten. Ejemplo real: `src/app/api/debug/ninos.ts` parece endpoint
abierto, pero no se llama `route.ts`, así que Next.js no lo sirve — reportarlo como endpoint
expuesto sería un falso positivo.

## Formato de salida

1. **Hallazgos por severidad** (CRÍTICA → BAJA), cada uno con archivo:línea, explotación en
   una frase, y el arreglo concreto (comando o diff, no "considerar mejorar").
2. **Observaciones** (lo que no alcanzó a ser hallazgo).
3. **Lo que NO se revisó** — lista honesta (p. ej. "no probé el endpoint en producción",
   "no revisé el historial completo de git", "no verifiqué la config de Supabase RLS").

## Verificación post-arreglo

Tras cualquier fix: `npm run build` local (debe pasar), `git push` (deploy automático), y
confirmar `https://debt-tracker-inky.vercel.app/api/health` → `"db":"connected"` y que
`/dashboard` carga con datos.
