-- Wave 2.6: Estimation / Dự toán tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ghxeugllxqnlqzdrxewl/sql

create table if not exists estimates (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references studios(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null default 'Dự toán',
  version int default 1,
  currency text default 'VND',
  exchange_rate numeric(10,4) default 1,
  vat_pct numeric(5,2) default 10,
  contingency_pct numeric(5,2) default 0,
  status text check (status in ('draft','sent','approved','rejected','converted')) default 'draft',
  notes text,
  approval_token text unique default gen_random_uuid()::text,
  sent_at timestamptz,
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists estimates_project_id_idx on estimates(project_id);
create index if not exists estimates_studio_id_idx on estimates(studio_id);

create table if not exists estimate_sections (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid references estimates(id) on delete cascade,
  name text not null,
  sort_order int default 0
);
create index if not exists estimate_sections_estimate_id_idx on estimate_sections(estimate_id);

create table if not exists estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid references estimates(id) on delete cascade,
  section_id uuid references estimate_sections(id) on delete set null,
  description text not null,
  unit text default 'cái',
  quantity numeric default 1,
  unit_price numeric(14,2) default 0,
  markup_pct numeric(5,2) default 0,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index if not exists estimate_items_estimate_id_idx on estimate_items(estimate_id);

-- RLS
alter table estimates enable row level security;
alter table estimate_sections enable row level security;
alter table estimate_items enable row level security;

create policy "estimates_select" on estimates for select
  using (studio_id in (select studio_id from memberships where user_id = auth.uid()));
create policy "estimates_insert" on estimates for insert
  with check (studio_id in (select studio_id from memberships where user_id = auth.uid()));
create policy "estimates_update" on estimates for update
  using (studio_id in (select studio_id from memberships where user_id = auth.uid()));
create policy "estimates_delete" on estimates for delete
  using (studio_id in (select studio_id from memberships where user_id = auth.uid()));

create policy "estimate_sections_select" on estimate_sections for select
  using (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));
create policy "estimate_sections_insert" on estimate_sections for insert
  with check (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));
create policy "estimate_sections_update" on estimate_sections for update
  using (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));
create policy "estimate_sections_delete" on estimate_sections for delete
  using (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));

create policy "estimate_items_select" on estimate_items for select
  using (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));
create policy "estimate_items_insert" on estimate_items for insert
  with check (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));
create policy "estimate_items_update" on estimate_items for update
  using (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));
create policy "estimate_items_delete" on estimate_items for delete
  using (estimate_id in (select id from estimates where studio_id in (select studio_id from memberships where user_id = auth.uid())));
