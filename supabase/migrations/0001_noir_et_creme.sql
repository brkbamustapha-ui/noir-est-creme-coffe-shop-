-- Noir et Crème — état final du schéma.
-- Toutes les tables sont préfixées `noir_` pour cohabiter sans collision avec
-- d'autres schémas présents sur le même projet Supabase.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tables ---
create table if not exists public.noir_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  tagline    text,
  layout     text not null default 'list' check (layout in ('list','cards')),
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.noir_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.noir_categories(id) on delete cascade,
  name         text not null,
  description  text,
  price        text not null default '',
  is_available boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.noir_settings (
  id         integer primary key default 1,
  shop_name  text not null default 'NOIR ET CRÈME',
  slogan     text not null default 'L''ART DU CAFÉ, L''ESPRIT FRAIS',
  subtitle   text not null default 'A little Oran closer to home',
  address    text not null default 'Gambetta, Oran',
  hours      text not null default '09h00 – 22h00',
  phone      text default '',
  currency   text not null default 'DA',
  updated_at timestamptz not null default now(),
  constraint noir_settings_singleton check (id = 1)
);

create index if not exists noir_items_category_idx  on public.noir_items (category_id, sort_order);
create index if not exists noir_categories_sort_idx on public.noir_categories (sort_order);

-- --------------------------------------------------------------- trigger ---
create or replace function public.noir_touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.noir_touch_updated_at() from anon, authenticated, public;

create trigger noir_categories_touch before update on public.noir_categories
  for each row execute function public.noir_touch_updated_at();
create trigger noir_items_touch before update on public.noir_items
  for each row execute function public.noir_touch_updated_at();
create trigger noir_settings_touch before update on public.noir_settings
  for each row execute function public.noir_touch_updated_at();

-- ------------------------------------------------------------------- RLS ---
-- Lecture publique ; aucune écriture possible avec la clé publique.
alter table public.noir_categories enable row level security;
alter table public.noir_items      enable row level security;
alter table public.noir_settings   enable row level security;

create policy noir_categories_public_read on public.noir_categories for select to anon, authenticated using (true);
create policy noir_items_public_read      on public.noir_items      for select to anon, authenticated using (true);
create policy noir_settings_public_read   on public.noir_settings   for select to anon, authenticated using (true);

revoke insert, update, delete on public.noir_items      from anon, authenticated;
revoke insert, update, delete on public.noir_categories from anon, authenticated;
revoke insert, update, delete on public.noir_settings   from anon, authenticated;

-- ----------------------------------------------------- secret côté serveur ---
create schema if not exists noir_private;
revoke all on schema noir_private from anon, authenticated;

create table if not exists noir_private.admin_secret (
  id         integer primary key default 1,
  token_hash text not null,
  constraint admin_secret_singleton check (id = 1)
);
revoke all on noir_private.admin_secret from anon, authenticated;

-- Remplacer par le SHA-256 hex de SUPABASE_ADMIN_TOKEN :
--   node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "<token>"
insert into noir_private.admin_secret (id, token_hash)
values (1, '<<SHA256_DE_SUPABASE_ADMIN_TOKEN>>')
on conflict (id) do update set token_hash = excluded.token_hash;

create or replace function noir_private.check_token(p_token text)
returns boolean language plpgsql security definer
set search_path = noir_private, public, extensions as $$
declare v_hash text;
begin
  if p_token is null or length(p_token) < 16 then return false; end if;
  select token_hash into v_hash from noir_private.admin_secret where id = 1;
  return v_hash is not null and encode(extensions.digest(p_token, 'sha256'), 'hex') = v_hash;
end;
$$;
revoke execute on function noir_private.check_token(text) from anon, authenticated;

-- --------------------------------------------------- RPC d'administration ---
-- Voir la migration `noir_et_creme_admin_rpc` appliquée sur le projet pour le
-- corps complet de noir_admin_save_item / delete_item / save_category /
-- delete_category / save_settings. Chacune commence par :
--     if not noir_private.check_token(p_token) then
--       raise exception 'unauthorized' using errcode = '42501';
--     end if;
-- et n'est exécutable que par le rôle `anon`, utilisé par le serveur Next.js
-- qui seul détient le secret.
