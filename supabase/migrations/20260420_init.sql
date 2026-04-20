-- Initial schema for clinical app

create extension if not exists "pgcrypto";

create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  edad integer not null check (edad between 1 and 149),
  cedula text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists historias_clinicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  diagnostico text not null,
  sintomas text not null,
  tratamiento text not null,
  fecha date not null,
  created_at timestamptz not null default now()
);

create table if not exists medicamentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text null,
  unidad text not null,
  created_at timestamptz not null default now()
);

create index if not exists medicamentos_nombre_idx on medicamentos (nombre);

create table if not exists prescripciones (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  medicamento_id uuid not null references medicamentos(id) on delete restrict,
  dosis text not null,
  frecuencia text not null,
  fecha_inicio date not null,
  fecha_fin date null,
  notas text null,
  created_at timestamptz not null default now()
);

create index if not exists prescripciones_paciente_idx on prescripciones (paciente_id);
create index if not exists prescripciones_medicamento_idx on prescripciones (medicamento_id);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid null,
  action text not null,
  summary text not null,
  meta jsonb null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on activity_logs (created_at desc);
