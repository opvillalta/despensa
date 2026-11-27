# Plan de desarrollo: App web de control de despensa (vencimientos y niveles)

> Documento pensado para entregarse a una IA (o a un equipo) y construir la app por fases.
> Idioma de la interfaz: español. Plataforma: **aplicación web mobile-first (PWA instalable)**.

---

## 1. Resumen del producto

Aplicación web, diseñada para usarse desde el teléfono, que permite:

1. **Registrar productos** comprados con su fecha de vencimiento y ubicación (refri, congelador, alacena).
2. **Ver qué vence pronto** para consumirlo a tiempo.
3. **Controlar cuánto queda** de cada producto, aunque no se cuente en unidades (lleno / mitad / poco / acabado).
4. **Generar una lista de compras** automática con lo que se está acabando.

### Problema que resuelve
Se compran cosas y se olvida que están en la refri o la alacena; se vencen o se acaban sin darnos cuenta.

### Principio de diseño más importante
**La fricción de registrar es el mayor riesgo.** Si agregar un producto es tedioso, la gente abandona la app. Toda decisión debe priorizar: pocos campos, valores por defecto inteligentes, acciones con un toque.

---

## 2. Decisiones asumidas (cambiar si no aplican)

| Tema | Decisión por defecto |
|---|---|
| Usuarios | Cuenta con correo (login). Modelo con **hogar** desde el inicio para poder compartir después. |
| Compartir | Preparado en el modelo de datos (`household_id`), pero la UI de invitaciones llega en la Fase 4. |
| Idioma | Solo español al inicio. Textos centralizados para internacionalizar luego. |
| Offline | Lectura offline del inventario; escritura offline en Fase 2. |
| Monetización | Fuera de alcance por ahora. |

---

## 3. Stack tecnológico propuesto

- **Frontend:** React + TypeScript + Vite
- **Estilos:** Tailwind CSS (diseño mobile-first, botones grandes, acción principal al alcance del pulgar)
- **Estado de servidor / caché:** TanStack Query
- **Validación:** Zod
- **PWA:** `vite-plugin-pwa` (service worker + manifest)
- **Backend / BD:** Supabase (PostgreSQL + Auth + Row Level Security) — *alternativa:* API propia con PostgreSQL desplegada en AWS
- **Escáner de códigos de barras (Fase 3):** `html5-qrcode` o `zxing-js` (la API nativa `BarcodeDetector` no funciona en iOS Safari)
- **Datos de productos (Fase 3):** API pública de Open Food Facts
- **Pruebas:** Vitest (unitarias) + Playwright (end-to-end en viewport móvil)
- **Despliegue:** Vercel / Netlify / AWS Amplify (HTTPS obligatorio por cámara y service worker)

### Limitaciones conocidas de las PWA
- En **iPhone**, las notificaciones push solo funcionan si la app está **instalada en la pantalla de inicio** (iOS 16.4+).
- La cámara requiere **HTTPS**.
- Alternativa si las notificaciones push fallan: resumen diario por correo o Telegram.

---

## 4. Reglas de negocio

### 4.1 Tipos de seguimiento de cantidad

Cada producto tiene un `tracking_type`:

| Tipo | Ejemplos | Cómo se controla |
|---|---|---|
| `units` | huevos, latas, yogures | Contador entero (6 → 5 → 4) |
| `level` | arroz, aceite, leche, detergente | `full` / `half` / `low` / `empty` |
| `presence` | sal, especias | Tengo / No tengo |

- El tipo por defecto se sugiere según la categoría, pero el usuario lo puede cambiar.
- Cambiar el nivel o la cantidad debe ser **una sola interacción** (toque en un selector, no un formulario).

### 4.2 Estados de vencimiento

Calculados a partir de `expiry_date` (o de `opened_at + days_after_opening`, lo que ocurra primero):

| Estado | Condición | Color sugerido |
|---|---|---|
| `ok` | faltan más de N días | neutro / verde |
| `soon` | faltan N días o menos (N configurable, por defecto 3) | amarillo / naranja |
| `expired` | fecha ya pasada | rojo |
| `none` | sin fecha definida | gris |

> El color nunca debe ser la única señal: acompañar con texto ("Vence en 2 días", "Venció hace 1 día") e ícono.

### 4.3 Producto abierto
Muchos productos duran distinto al abrirse. Campos:
- `opened_at`: fecha de apertura (botón "Marcar como abierto").
- `days_after_opening`: días de vida útil tras abrir (opcional, sugerido por categoría).
- Fecha efectiva de vencimiento = `min(expiry_date, opened_at + days_after_opening)`.

### 4.4 Lista de compras automática
- Cuando un ítem pasa a `low` o `empty` (o `quantity = 0` en `units`), se **sugiere** agregarlo a la lista de compras (sin duplicar si ya está).
- Al marcar un ítem de la lista como comprado, se ofrece registrarlo directamente en el inventario (flujo "compra en lote").

### 4.5 Ciclo de vida de un ítem
`active` → `consumed` (se terminó / se usó) o `discarded` (se tiró, normalmente vencido).
Cada cambio se guarda en un historial para estadísticas futuras de desperdicio.

---

## 5. Modelo de datos (PostgreSQL)

```sql
-- Hogares (permite compartir inventario)
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table household_members (
  household_id uuid references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',   -- 'owner' | 'member'
  primary key (household_id, user_id)
);

-- Ubicaciones (refri, congelador, alacena...)
create table locations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  icon text,
  sort_order int default 0
);

-- Categorías con valores por defecto
create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  default_tracking_type text not null default 'units',   -- units | level | presence
  default_shelf_life_days int,                            -- sin abrir
  default_days_after_opening int
);

-- Catálogo de productos del hogar (se autocompleta con lo ya registrado)
create table products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  category_id uuid references categories(id),
  tracking_type text not null default 'units',
  barcode text,
  default_location_id uuid references locations(id),
  unique (household_id, name)
);

-- Ítems en inventario (lo que realmente tienes)
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  product_id uuid not null references products(id),
  location_id uuid references locations(id),
  purchased_at date,
  expiry_date date,
  opened_at date,
  days_after_opening int,
  quantity int,                 -- si tracking_type = 'units'
  level text,                   -- 'full' | 'half' | 'low' | 'empty' si 'level'
  status text not null default 'active',  -- active | consumed | discarded
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on inventory_items (household_id, status, expiry_date);

-- Lista de compras
create table shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  checked boolean default false,
  created_at timestamptz default now()
);

-- Historial de eventos (base para estadísticas)
create table item_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  item_id uuid references inventory_items(id) on delete set null,
  type text not null,           -- created | level_changed | quantity_changed | opened | consumed | discarded
  payload jsonb,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);
```

**Seguridad:** activar Row Level Security en todas las tablas; el acceso se limita a usuarios que sean miembros del `household_id` de la fila.

---

## 6. Pantallas

1. **Inicio**
   - Bloque "Vence pronto" (ordenado por fecha efectiva).
   - Bloque "Se está acabando" (niveles `low` / `empty`).
   - Botón flotante "+ Agregar".
2. **Inventario**
   - Lista con buscador, filtros por ubicación, categoría y estado.
   - Cada fila: nombre, ubicación, estado de vencimiento (texto + color), nivel/cantidad con control rápido.
3. **Agregar / Editar producto**
   - Campos mínimos: nombre (autocompletar), ubicación, fecha de vencimiento, cantidad o nivel.
   - Avanzado (colapsado): fecha de compra, abierto, días tras abrir, categoría, notas.
   - Si se elige categoría con vida útil por defecto y no se pone fecha, se sugiere una.
4. **Detalle del ítem**
   - Fechas, nivel, historial, acciones: "Marcar abierto", "Consumido", "Desechado".
5. **Lista de compras**
   - Casillas para marcar comprado; al marcar, ofrecer "agregar al inventario".
6. **Ajustes**
   - Días de aviso, hora del resumen diario, gestión de ubicaciones y categorías, cerrar sesión.

### Criterios de UX móvil
- Diseñar primero para 360–430 px de ancho.
- Áreas táctiles mínimas de 44×44 px.
- Acción principal en la parte inferior de la pantalla.
- Teclado numérico / selector de fecha nativo en los campos correspondientes.
- Carga inicial rápida (< 3 s en 4G).

---

## 7. Roadmap por fases

### Fase 0 — Definición (2–3 días)
**Entregables:** wireframes de las 6 pantallas, confirmación de las decisiones de la sección 2, lista de categorías y ubicaciones iniciales.
**Criterio de salida:** wireframes aprobados.

### Fase 1 — MVP (2–3 semanas)
**Alcance:**
- Proyecto base (Vite + React + TS + Tailwind), autenticación, creación automática de hogar con ubicaciones y categorías por defecto.
- CRUD de ítems de inventario con los 3 tipos de seguimiento.
- Cálculo y visualización de estados de vencimiento.
- Pantalla de Inicio e Inventario con filtros y buscador.
- Cambio rápido de nivel/cantidad; marcar consumido / desechado.
- Lista de compras manual + sugerencia automática desde `low` / `empty`.
- RLS en todas las tablas.

**Criterios de aceptación:**
- [ ] Un usuario nuevo puede registrarse, agregar un producto en menos de 15 segundos y verlo en Inicio.
- [ ] Un producto con vencimiento en ≤ N días aparece en "Vence pronto".
- [ ] Cambiar un producto a "Poco" lo sugiere en la lista de compras sin duplicados.
- [ ] Un usuario no puede leer ni modificar datos de otro hogar (probado).
- [ ] La app es usable y sin scroll horizontal en 360 px de ancho.

### Fase 2 — PWA, avisos y offline (1–2 semanas)
**Alcance:**
- Manifest e íconos, instalación en pantalla de inicio.
- Notificaciones push con resumen diario (hora configurable).
- Caché offline del inventario; cola de escrituras offline con sincronización.
- Autocompletado desde el catálogo de productos ya registrados.
- "Compra en lote": registrar varios productos seguidos tras ir al súper.

**Criterios de aceptación:**
- [ ] La app se puede instalar en Android e iOS.
- [ ] Sin conexión se puede consultar el inventario y registrar cambios que se sincronizan al volver la red.
- [ ] El resumen diario llega a la hora configurada y lista lo que vence en ≤ N días.
- [ ] Registrar 5 productos de un mismo viaje al súper toma menos de 2 minutos.

### Fase 3 — Captura rápida (1–2 semanas)
**Alcance:**
- Escáner de código de barras con consulta a Open Food Facts para autocompletar nombre y categoría.
- Vida útil sugerida por categoría cuando no hay fecha.
- Opcional: lectura de fecha de vencimiento con la cámara (OCR).

**Criterios de aceptación:**
- [ ] Escanear un código conocido rellena el nombre; si no se encuentra, se permite ingreso manual sin bloquear.
- [ ] El flujo funciona en Chrome Android y Safari iOS.

### Fase 4 — Hogar compartido y estadísticas (según interés)
**Alcance:**
- Invitar a otras personas al hogar (enlace o correo).
- Estadísticas de desperdicio (consumido vs. desechado) usando `item_events`.
- Sugerencias de recetas con ingredientes próximos a vencer.

**Criterios de aceptación:**
- [ ] Dos usuarios del mismo hogar ven y editan el mismo inventario en tiempo casi real.
- [ ] El panel muestra el porcentaje de productos desechados por mes.

---

## 8. Estructura de carpetas sugerida

```
src/
  app/            # rutas, layout, providers
  features/
    inventory/    # lista, filtros, tarjeta de ítem, control de nivel
    products/     # catálogo y autocompletado
    shopping/     # lista de compras
    settings/
    auth/
  lib/            # cliente Supabase, fechas, utilidades de estado de vencimiento
  components/     # UI reutilizable (botones, selector de nivel, badges)
  i18n/           # textos en español
tests/
  unit/
  e2e/
```

---

## 9. Calidad y pruebas

- **Unitarias:** cálculo de estado de vencimiento (incluye producto abierto), reglas de lista de compras, utilidades de fecha.
- **End-to-end (Playwright, viewport móvil):** registro → agregar producto → cambiar nivel → aparece en lista de compras.
- **Seguridad:** pruebas de RLS con dos usuarios de hogares distintos.
- **Accesibilidad:** contraste suficiente, etiquetas en controles, estado no dependiente solo del color.
- **Rendimiento:** Lighthouse móvil ≥ 90 en Performance y PWA.

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Registrar productos da pereza y la app se abandona | Formulario mínimo, autocompletado, compra en lote, escáner (Fase 3) |
| Notificaciones no funcionan bien en iPhone | Documentar que requiere instalación; ofrecer resumen por correo/Telegram |
| Productos sin fecha impresa (frutas, sobras) | Vida útil por defecto por categoría |
| Datos de Open Food Facts incompletos | Ingreso manual siempre disponible; guardar lo ingresado en el catálogo propio |
| Fuga de datos entre hogares | RLS desde la Fase 1 y pruebas automatizadas |

---

## 11. Instrucciones para la IA que implemente este plan

1. Trabajar **una fase a la vez**; no adelantar funcionalidades de fases posteriores.
2. Al terminar cada fase, verificar los **criterios de aceptación** y reportar cuáles se cumplen.
3. Mantener el código tipado (TypeScript estricto) y los textos de interfaz en `src/i18n/`.
4. No almacenar secretos en el repositorio; usar variables de entorno.
5. Ante una decisión no definida en este documento, elegir la opción más simple y dejarla anotada en un archivo `DECISIONES.md`.
