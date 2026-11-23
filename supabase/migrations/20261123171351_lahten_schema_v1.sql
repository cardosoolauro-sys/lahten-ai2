-- lahten_schema_v1
-- Esta migration já está aplicada no projeto remoto (mesma versão no histórico).
-- O conteúdo abaixo foi reconstruído a partir do banco (tabelas, funções, políticas, índices e triggers)
-- para que o repositório tenha o schema versionado. Regras de ON DELETE e grants não foram lidas
-- do banco; se precisar do dump exato, rode `npx supabase db pull`.

create schema if not exists private;
grant usage on schema private to authenticated;

-- Tabelas -------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  org_id uuid not null references public.organizations (id),
  user_id uuid not null references auth.users (id),
  role text not null default 'agent'
    check (role = any (array['owner', 'admin', 'agent', 'viewer'])),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  title text not null,
  property_type text not null default 'apartment'
    check (property_type = any (array['apartment', 'house', 'land', 'commercial', 'other'])),
  purpose text not null default 'sale'
    check (purpose = any (array['sale', 'rent', 'both'])),
  status text not null default 'available'
    check (status = any (array['available', 'reserved', 'sold', 'rented', 'inactive'])),
  address text,
  city text,
  state text,
  bedrooms integer,
  bathrooms integer,
  area_m2 numeric,
  sale_price numeric,
  rent_price numeric,
  description text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  full_name text not null,
  email text,
  phone text,
  kind text not null default 'lead'
    check (kind = any (array['lead', 'client', 'owner', 'tenant'])),
  status text not null default 'new'
    check (status = any (array['new', 'contacted', 'qualified', 'lost', 'converted'])),
  source text,
  interest text,
  notes text,
  assigned_to uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  property_id uuid references public.properties (id),
  contact_id uuid references public.contacts (id),
  stage text not null default 'proposal'
    check (stage = any (array['proposal', 'visit', 'negotiation', 'won', 'lost'])),
  value numeric,
  expected_close date,
  assigned_to uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rentals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  property_id uuid not null references public.properties (id),
  tenant_id uuid references public.contacts (id),
  start_date date,
  end_date date,
  monthly_rent numeric,
  status text not null default 'pending_review'
    check (status = any (array['pending_review', 'active', 'ended'])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  contact_id uuid references public.contacts (id),
  deal_id uuid references public.deals (id),
  kind text not null default 'note'
    check (kind = any (array['note', 'call', 'visit', 'email', 'task'])),
  description text not null,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Índices -------------------------------------------------------------------

create index activities_contact_idx on public.activities using btree (contact_id);
create index activities_deal_idx on public.activities using btree (deal_id);
create index activities_org_idx on public.activities using btree (org_id);
create index contacts_assigned_idx on public.contacts using btree (assigned_to);
create index contacts_org_idx on public.contacts using btree (org_id);
create index deals_assigned_idx on public.deals using btree (assigned_to);
create index deals_contact_idx on public.deals using btree (contact_id);
create index deals_org_idx on public.deals using btree (org_id);
create index deals_property_idx on public.deals using btree (property_id);
create index memberships_user_idx on public.memberships using btree (user_id);
create index properties_org_idx on public.properties using btree (org_id);
create index properties_status_idx on public.properties using btree (org_id, status);
create index rentals_org_idx on public.rentals using btree (org_id);
create index rentals_property_idx on public.rentals using btree (property_id);
create index rentals_tenant_idx on public.rentals using btree (tenant_id);

-- Funções -------------------------------------------------------------------

create or replace function private.is_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org and m.user_id = (select auth.uid())
  );
$function$;

create or replace function private.is_admin(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1 from public.memberships m
    where m.org_id = p_org
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin')
  );
$function$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.create_organization(p_name text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_org uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  insert into public.organizations(name) values (p_name) returning id into v_org;
  insert into public.memberships(org_id, user_id, role)
    values (v_org, (select auth.uid()), 'owner');
  return v_org;
end;
$function$;

-- Triggers ------------------------------------------------------------------

create trigger contacts_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();
create trigger deals_updated_at before update on public.deals
  for each row execute function public.set_updated_at();
create trigger properties_updated_at before update on public.properties
  for each row execute function public.set_updated_at();
create trigger rentals_updated_at before update on public.rentals
  for each row execute function public.set_updated_at();

-- RLS -----------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.properties enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.rentals enable row level security;
alter table public.activities enable row level security;

create policy org_select on public.organizations for select to authenticated
  using (private.is_member(id));
create policy org_update on public.organizations for update to authenticated
  using (private.is_admin(id)) with check (private.is_admin(id));
create policy org_delete on public.organizations for delete to authenticated
  using (private.is_admin(id));

create policy mem_select on public.memberships for select to authenticated
  using (private.is_member(org_id));
create policy mem_insert on public.memberships for insert to authenticated
  with check (private.is_admin(org_id));
create policy mem_update on public.memberships for update to authenticated
  using (private.is_admin(org_id)) with check (private.is_admin(org_id));
create policy mem_delete on public.memberships for delete to authenticated
  using (private.is_admin(org_id));

create policy properties_all on public.properties for all to authenticated
  using (private.is_member(org_id)) with check (private.is_member(org_id));
create policy contacts_all on public.contacts for all to authenticated
  using (private.is_member(org_id)) with check (private.is_member(org_id));
create policy deals_all on public.deals for all to authenticated
  using (private.is_member(org_id)) with check (private.is_member(org_id));
create policy rentals_all on public.rentals for all to authenticated
  using (private.is_member(org_id)) with check (private.is_member(org_id));
create policy activities_all on public.activities for all to authenticated
  using (private.is_member(org_id)) with check (private.is_member(org_id));
