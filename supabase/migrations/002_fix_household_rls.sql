-- ============================================================
-- Fix para usuarios sin hogar y permisos de creación (RLS)
-- ============================================================

-- 1. Política para permitir que usuarios autenticados creen un hogar si no tienen uno
create policy "Usuarios autenticados pueden crear un hogar"
  on public.households for insert
  to authenticated
  with check (true);

-- 2. Política para permitir que el creador se agregue como miembro del hogar
create policy "Usuarios autenticados pueden vincularse a un hogar"
  on public.household_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- 3. Crear hogar y membrecía retroactiva para todos los usuarios existentes en auth.users que no tengan hogar
do $$
declare
  u record;
  v_household_id uuid;
  v_refri_id uuid;
  v_congelador_id uuid;
  v_alacena_id uuid;
  v_despensa_id uuid;
begin
  for u in 
    select id from auth.users 
    where id not in (select user_id from public.household_members)
  loop
    -- Crear hogar
    insert into public.households (name)
    values ('Mi Hogar')
    returning id into v_household_id;

    -- Vincular usuario como owner
    insert into public.household_members (household_id, user_id, role)
    values (v_household_id, u.id, 'owner');

    -- Crear ubicaciones básicas
    insert into public.locations (household_id, name, icon, sort_order) values
      (v_household_id, 'Refrigerador',  '🧊', 1) returning id into v_refri_id;
    insert into public.locations (household_id, name, icon, sort_order) values
      (v_household_id, 'Congelador',    '❄️', 2) returning id into v_congelador_id;
    insert into public.locations (household_id, name, icon, sort_order) values
      (v_household_id, 'Alacena',       '🗄️', 3) returning id into v_alacena_id;
    insert into public.locations (household_id, name, icon, sort_order) values
      (v_household_id, 'Despensa',      '📦', 4) returning id into v_despensa_id;

    -- Crear categorías básicas
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
  end loop;
end;
$$;
