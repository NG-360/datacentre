-- Table pour la feuille de match (brouillon partagé)
create table if not exists feuille (
  id text primary key default 'active',
  date date,
  heure text default '20:30',
  presents text[] default '{}',
  invites jsonb default '[]',
  team_a text[] default '{}',
  team_b text[] default '{}',
  updated_at timestamp with time zone default now()
);

alter table feuille enable row level security;
create policy "Public read feuille"   on feuille for select using (true);
create policy "Public insert feuille" on feuille for insert with check (true);
create policy "Public update feuille" on feuille for update using (true);
