# Decisiones de implementación

> Archivo para registrar decisiones no cubiertas por el plan original.

## 2026-11-24 — Configuración inicial

### D001: Tailwind v4 con @tailwindcss/vite
- **Decisión**: Usar `@tailwindcss/vite` plugin en lugar de PostCSS
- **Por qué**: Tailwind v4 recomienda el plugin de Vite para mejor integración y HMR más rápido; elimina el `tailwind.config.js` y `postcss.config.js`
- **Referencia**: https://tailwindcss.com/docs/installation/vite

### D002: React 19 sin useMemo/useCallback
- **Decisión**: No usar `useMemo` ni `useCallback` salvo casos muy específicos
- **Por qué**: React 19 con el React Compiler maneja la memoización automáticamente
- **Impacto**: Código más limpio, sin optimizaciones prematuras

### D003: Settings como JSONB en households
- **Decisión**: Campo `settings JSONB` en la tabla `households` en lugar de tabla separada
- **Por qué**: Fase 1 solo necesita `days_warning` (default 3). Tabla separada es over-engineering para 1 valor
- **Revisión**: Si en Fase 4 los settings crecen mucho, migrar a tabla

### D004: Creación de hogar via DB trigger
- **Decisión**: Trigger `handle_new_user()` en Supabase que crea hogar + datos por defecto al INSERT en `auth.users`
- **Por qué**: Elimina la necesidad de lógica en el cliente; es atómica y segura
- **Alternativa descartada**: Edge Function (más overhead, latencia adicional)

### D005: Cálculo de expiry_effective en cliente
- **Decisión**: `calculateExpiryStatus()` es una función TypeScript pura en `src/lib/expiry.ts`
- **Por qué**: Testeable con Vitest sin DB, más rápido para render, sin viaje al servidor
- **Trade-off**: Si cambian las reglas, hay que deployar frontend; en DB sería solo migración

### D006: TypeScript strict mode + erasableSyntaxOnly
- **Decisión**: Mantener la config de TS 7 generada por Vite (`erasableSyntaxOnly: true`)
- **Por qué**: TS 7 puede ejecutarse nativamente sin transpilación; esta flag asegura compatibilidad
- **Impacto**: No usar `const enum` ni `namespace`; usar `type` imports

### D007: React Router v6 con createBrowserRouter
- **Decisión**: Usar `createBrowserRouter` (data router API) en lugar de `<BrowserRouter>`
- **Por qué**: Permite loaders y actions en el futuro, mejor tipado, es el camino forward de RR

### D008: Migración a pnpm
- **Decisión**: Usar `pnpm` como package manager en lugar de `npm`
- **Por qué**: Mayor velocidad en resolución/instalación, aislamiento estricto de dependencias no declaradas y ahorro de almacenamiento en disco con hard links

