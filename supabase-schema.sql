-- Run this in your Supabase SQL editor

create table checkit_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table checkit_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references checkit_lists(id) on delete cascade,
  text text not null,
  created_by text not null,
  completed boolean default false,
  completed_by text,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Enable Row Level Security (allow public access — no auth needed)
alter table checkit_lists enable row level security;
alter table checkit_items enable row level security;

create policy "Public read checkit_lists" on checkit_lists for select using (true);
create policy "Public insert checkit_lists" on checkit_lists for insert with check (true);

create policy "Public read checkit_items" on checkit_items for select using (true);
create policy "Public insert checkit_items" on checkit_items for insert with check (true);
create policy "Public update checkit_items" on checkit_items for update using (true);
create policy "Public delete checkit_items" on checkit_items for delete using (true);

-- Enable Realtime
alter publication supabase_realtime add table checkit_items;
