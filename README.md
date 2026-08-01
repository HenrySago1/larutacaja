# La Ruta Caja

Sistema web de caja e inventario para la Licoreria La Ruta.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind, Shadcn UI, React Query, Zustand.
- Backend: NestJS, Prisma, PostgreSQL.
- Servicios: Firebase Authentication y Firebase Storage.

## Estructura

```text
apps/
  backend/
  frontend/
docs/
```

## Arranque

1. Copiar `apps/backend/.env.example` a `apps/backend/.env`.
2. Copiar `apps/frontend/.env.example` a `apps/frontend/.env`.
3. Instalar dependencias con `pnpm install`.
4. Generar Prisma Client con `pnpm prisma:generate`.
5. Crear migraciones con `pnpm prisma:migrate`.
6. Sembrar datos iniciales con `pnpm seed`.
7. Ejecutar `pnpm dev`.

## Variables clave

- `DATABASE_URL`: conexion PostgreSQL.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: credenciales de Firebase Admin para validar tokens y crear cajeros.
- `VITE_FIREBASE_*`: configuracion del SDK web para login y Firebase Storage.
- `SEED_ADMIN_EMAIL` y `SEED_ADMIN_FIREBASE_UID`: crean el administrador inicial vinculado a un usuario existente en Firebase Authentication.

## Reglas implementadas

- Una sola caja abierta a la vez.
- Ventas y egresos requieren caja abierta.
- Cierre calcula diferencia y exige notas cuando hay faltante o sobrante.
- Ventas en efectivo incrementan caja esperada; QR y transferencia solo se acumulan para conciliacion.
- Descuento de stock transaccional con rechazo por conflicto si cambia el stock.
- Cajeros no pueden crear ni editar productos, cajeros, reportes ni impulsadoras.
