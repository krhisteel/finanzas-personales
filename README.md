# Finanzas Personales

Aplicación web para gestionar finanzas personales: cuentas, transacciones, categorías y un resumen mensual.

**Stack:** React + TypeScript + Vite + Tailwind CSS + Supabase (Postgres, Auth) + Recharts.

## Puesta en marcha

1. El proyecto de Supabase ya está creado (`finanzas-personales`, región São Paulo). Para uno nuevo, créalo en [supabase.com](https://supabase.com).
2. Las migraciones de `supabase/migrations/` ya están aplicadas. En un proyecto nuevo, ejecútalas en orden en el **SQL Editor**.
3. Copia `.env.example` a `.env` (ya trae la URL y la clave pública del proyecto `finanzas-personales`).
4. Instala y ejecuta:
   ```bash
   npm install
   npm run dev
   ```
5. Abre http://localhost:5173, crea tu usuario y empieza a registrar movimientos.

## Hoja de ruta

- [x] **Fase 1 (MVP):** autenticación, cuentas, categorías, transacciones (ingreso, gasto, transferencia) y resumen.
- [ ] **Fase 2:** presupuestos por categoría, transacciones recurrentes, reportes mensuales.
- [ ] **Fase 3:** metas de ahorro, deudas, tarjetas de crédito con cuotas, exportar a CSV/PDF.
- [ ] **Fase 4:** importar cartolas bancarias, reglas de categorización automática, notificaciones.
- [ ] **Fase 5:** inversiones, gastos compartidos, asistente con IA, app móvil.

## Estructura

```
src/
  components/   Layout y componentes compartidos
  lib/          Cliente Supabase, tipos, hooks de datos y formato
  pages/        Resumen, Transacciones, Cuentas, Categorías, Login
supabase/
  migrations/   Esquema SQL con Row Level Security
```
