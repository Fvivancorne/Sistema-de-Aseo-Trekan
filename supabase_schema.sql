-- ─── ASEO COMUNITARIO COLEGIO WALDORF TREKAN ───────────────────────────────
-- Run this in Supabase → SQL Editor → New query → Run

-- 1. FAMILIAS
create table if not exists familias (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  nombre text not null,
  participaciones_totales integer default 0,
  ultima_participacion date,
  participaciones_por_mes jsonb default '{}',
  ausencias integer default 0,
  activa boolean default true
);

-- 2. SEMANAS
create table if not exists semanas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  fecha date not null,
  numero_semana integer not null,
  anio integer,
  bloqueado boolean default false,
  familia1_id uuid references familias(id) on delete set null,
  familia1_nombre text,
  familia2_id uuid references familias(id) on delete set null,
  familia2_nombre text,
  familia3_id uuid references familias(id) on delete set null,
  familia3_nombre text,
  ausentes_ids uuid[] default '{}'
);

-- 3. INTERCAMBIOS
create table if not exists intercambios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  familia_a_id uuid references familias(id) on delete set null,
  familia_a_nombre text,
  fecha_a date not null,
  familia_b_id uuid references familias(id) on delete set null,
  familia_b_nombre text,
  fecha_b date not null,
  observacion text,
  estado text default 'pendiente' check (estado in ('pendiente','aplicado','rechazado'))
);

-- 4. HISTORIAL_CAMBIOS
create table if not exists historial_cambios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  tipo_cambio text not null check (tipo_cambio in ('intercambio_voluntario','ausencia','cambio_manual','ajuste_automatico')),
  familia_anterior_id uuid references familias(id) on delete set null,
  familia_anterior_nombre text,
  familia_nueva_id uuid references familias(id) on delete set null,
  familia_nueva_nombre text,
  fecha_turno date not null,
  fecha_compensacion date,
  deuda_pendiente boolean default false,
  descripcion text
);

-- 5. PERIODOS_BLOQUEADOS
create table if not exists periodos_bloqueados (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  nombre text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  tipo text default 'festivo' check (tipo in ('vacaciones','festivo','cierre')),
  activo boolean default true
);

-- Enable Row Level Security but allow all for anon (single-user app)
alter table familias enable row level security;
alter table semanas enable row level security;
alter table intercambios enable row level security;
alter table historial_cambios enable row level security;
alter table periodos_bloqueados enable row level security;

create policy "allow all familias"           on familias           for all using (true) with check (true);
create policy "allow all semanas"            on semanas            for all using (true) with check (true);
create policy "allow all intercambios"       on intercambios       for all using (true) with check (true);
create policy "allow all historial_cambios"  on historial_cambios  for all using (true) with check (true);
create policy "allow all periodos_bloqueados" on periodos_bloqueados for all using (true) with check (true);
