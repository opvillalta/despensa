# Despensa — Control de Despensa y Vencimientos

Aplicación web mobile-first para el control inteligente del inventario del hogar, seguimiento de fechas de vencimiento y generación automática de listas de compras.

## Características

- 🥫 **Control de Inventario**: Registro rápido de productos con fecha de vencimiento y ubicación (Refrigerador, Congelador, Alacena, Despensa).
- ⏰ **Alertas de Vencimiento**: Identificación automática de productos vencidos o próximos a vencer.
- 📊 **Seguimiento Flexible**: Monitoreo por unidades (`units`), nivel visual (`level`) y disponibilidad (`presence`).
- 🛒 **Lista de Compras Automática**: Detección inteligente de stock bajo para reabastecimiento sin esfuerzo.
- 🔒 **Multi-hogar y Seguridad**: Integrado con Supabase Auth y Row Level Security (RLS).

## Stack Tecnológico

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Estado y Caché**: TanStack Query
- **Backend & DB**: Supabase (PostgreSQL + Auth + RLS)
- **Testing**: Vitest, Playwright

## Configuración y Desarrollo

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar variables de entorno en `.env.local`:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

3. Iniciar entorno de desarrollo:
   ```bash
   pnpm dev
   ```
