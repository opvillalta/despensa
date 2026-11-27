-- ============================================================
-- Migration 001: Schema inicial completo
-- App Despensa — Fase 1 MVP
-- ============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLAS BASE
-- ============================================================

-- Hogares: unidad de compartición de inventario
create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  settings    jsonb not null default '{"days_warning": 3}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Miembros del hogar
create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('owner', 'member')),
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Ubicaciones del hogar (Refri, Congelador, Alacena, etc.)
create table public.locations (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name         text not null,
  icon         text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- Categorías con valores por defecto para tracking
create table public.categories (
  id                      uuid primary key default gen_random_uuid(),
  household_id            uuid not null references public.households(id) on delete cascade,
  name                    text not null,
  default_tracking_type   text not null default 'units' check (default_tracking_type in ('units', 'level', 'presence')),
  default_shelf_life_days int,       -- días de vida útil sin abrir
  default_days_after_opening int,    -- días de vida útil al abrir
  created_at              timestamptz not null default now()
);

-- Catálogo de productos del hogar (se autocompleta con lo ya registrado)
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references public.households(id) on delete cascade,
  name                text not null,
  category_id         uuid references public.categories(id) on delete set null,
  tracking_type       text not null default 'units' check (tracking_type in ('units', 'level', 'presence')),
  barcode             text,
  default_location_id uuid references public.locations(id) on delete set null,
  created_at          timestamptz not null default now(),
  unique (household_id, name)
);

-- Ítems de inventario (lo que realmente tenés en casa)
create table public.inventory_items (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references public.households(id) on delete cascade,
  product_id          uuid not null references public.products(id) on delete cascade,
  location_id         uuid references public.locations(id) on delete set null,
  purchased_at        date,
  expiry_date         date,
  opened_at           date,
  days_after_opening  int,
  quantity            int,                     -- si tracking_type = 'units'
  level               text check (level in ('full', 'half', 'low', 'empty')),
  has_it              boolean,                 -- si tracking_type = 'presence'
  status              text not null default 'active' check (status in ('active', 'consumed', 'discarded')),
  notes               text,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Índice principal para queries del inventario activo
create index on public.inventory_items (household_id, status, expiry_date);
create index on public.inventory_items (household_id, status, level);

-- Lista de compras
create table public.shopping_list_items (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  name         text not null,
  checked      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Historial de eventos (base para estadísticas de desperdicio)
create table public.item_events (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  item_id      uuid references public.inventory_items(id) on delete set null,
  type         text not null check (type in ('created', 'level_changed', 'quantity_changed', 'opened', 'consumed', 'discarded')),
  payload      jsonb,
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.inventory_items
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TRIGGER: Crear hogar automáticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_household_id uuid;
  v_refri_id     uuid;
  v_congelador_id uuid;
  v_alacena_id   uuid;
  v_despensa_id  uuid;
begin
  -- 1. Crear el hogar
  insert into public.households (name)
  values ('Mi Hogar')
  returning id into v_household_id;

  -- 2. Vincular al usuario como owner
  insert into public.household_members (household_id, user_id, role)
  values (v_household_id, new.id, 'owner');

  -- 3. Crear ubicaciones por defecto
  insert into public.locations (household_id, name, icon, sort_order) values
    (v_household_id, 'Refrigerador',  '🧊', 1) returning id into v_refri_id;
  insert into public.locations (household_id, name, icon, sort_order) values
    (v_household_id, 'Congelador',    '❄️', 2) returning id into v_congelador_id;
  insert into public.locations (household_id, name, icon, sort_order) values
    (v_household_id, 'Alacena',       '🗄️', 3) returning id into v_alacena_id;
  insert into public.locations (household_id, name, icon, sort_order) values
    (v_household_id, 'Despensa',      '📦', 4) returning id into v_despensa_id;

  -- 4. Crear categorías por defecto con tracking sugerido
  insert into public.categories (household_id, name, default_tracking_type, default_shelf_life_days, default_days_after_opening) values
    (v_household_id, 'Lácteos',         'level',    30,  5),
    (v_household_id, 'Carnes',          'units',    5,   3),
    (v_household_id, 'Frutas y verduras','level',   7,   null),
    (v_household_id, 'Cereales y granos','level',   365, null),
    (v_household_id, 'Aceites y salsas','level',    365, 90),
    (v_household_id, 'Conservas',       'units',    730, 5),
    (v_household_id, 'Bebidas',         'level',    365, 3),
    (v_household_id, 'Panadería',       'units',    7,   3),
    (v_household_id, 'Congelados',      'units',    180, null),
    (v_household_id, 'Limpieza',        'level',    730, null),
    (v_household_id, 'Especias y condimentos', 'presence', 730, null),
    (v_household_id, 'Otros',           'units',    null, null);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Habilitar RLS en todas las tablas
alter table public.households          enable row level security;
alter table public.household_members   enable row level security;
alter table public.locations           enable row level security;
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.inventory_items     enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.item_events         enable row level security;

-- Función helper: obtener household_id del usuario actual
create or replace function public.get_my_household_id()
returns uuid language sql stable security definer set search_path = public as $$
  select household_id from public.household_members
  where user_id = auth.uid()
  limit 1;
$$;

-- ---- households ----
create policy "Miembros pueden ver su hogar"
  on public.households for select
  using (id = public.get_my_household_id());

create policy "Solo el owner puede actualizar el hogar"
  on public.households for update
  using (
    id = public.get_my_household_id()
    and exists (
      select 1 from public.household_members
      where household_id = id and user_id = auth.uid() and role = 'owner'
    )
  );

-- ---- household_members ----
create policy "Ver miembros de mi hogar"
  on public.household_members for select
  using (household_id = public.get_my_household_id());

-- ---- locations ----
create policy "Ver ubicaciones de mi hogar"
  on public.locations for select
  using (household_id = public.get_my_household_id());

create policy "Gestionar ubicaciones de mi hogar"
  on public.locations for all
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

-- ---- categories ----
create policy "Ver categorías de mi hogar"
  on public.categories for select
  using (household_id = public.get_my_household_id());

create policy "Gestionar categorías de mi hogar"
  on public.categories for all
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

-- ---- products ----
create policy "Ver productos de mi hogar"
  on public.products for select
  using (household_id = public.get_my_household_id());

create policy "Gestionar productos de mi hogar"
  on public.products for all
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

-- ---- inventory_items ----
create policy "Ver ítems de mi hogar"
  on public.inventory_items for select
  using (household_id = public.get_my_household_id());

create policy "Gestionar ítems de mi hogar"
  on public.inventory_items for all
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

-- ---- shopping_list_items ----
create policy "Ver lista de compras de mi hogar"
  on public.shopping_list_items for select
  using (household_id = public.get_my_household_id());

create policy "Gestionar lista de compras de mi hogar"
  on public.shopping_list_items for all
  using (household_id = public.get_my_household_id())
  with check (household_id = public.get_my_household_id());

-- ---- item_events ----
create policy "Ver eventos de mi hogar"
  on public.item_events for select
  using (household_id = public.get_my_household_id());

create policy "Registrar eventos de mi hogar"
  on public.item_events for insert
  with check (household_id = public.get_my_household_id());
