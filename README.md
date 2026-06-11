# Prospection OS

CRM multi-utilisateurs pour une equipe de prospection skincare coreen premium et marketing relationnel.

## Stack

- React + Vite
- Tailwind CSS
- Supabase Auth + Database
- Vercel

## Commandes

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Variables d'environnement

Projet Supabase :

```bash
VITE_SUPABASE_URL=https://gpvdofbrclnpodohkycw.supabase.co
VITE_SUPABASE_ANON_KEY=votre-publishable-key
```

En local, creer `.env.local` avec ces deux variables.  
Dans Vercel, ajouter les memes variables dans Project Settings > Environment Variables.

## Authentification

L'application utilise Supabase Auth avec :

- inscription email / mot de passe ;
- connexion email / mot de passe ;
- deconnexion ;
- recuperation de mot de passe par email.

Dans Supabase : Authentication > Providers > Email doit etre active.

## SQL Supabase

Executer ce SQL dans Supabase SQL Editor.

```sql
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'manager')),
  team_id uuid,
  daily_date date not null default current_date,
  daily_objectives text,
  messages_sent integer not null default 0,
  follow_ups_done integer not null default 0,
  calls_booked integer not null default 0,
  active_streak integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid,
  name text not null,
  phone text,
  whatsapp text,
  email text,
  city text,
  profession text,
  referred_by text,
  network text,
  profile_url text,
  avatar_id text,
  status text not null default 'A contacter',
  riman_stage text not null default 'Prospect',
  score text not null default 'Tiede',
  interest integer not null default 3,
  first_contact date,
  next_follow_up date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid,
  prospect_id uuid references public.prospects(id) on delete cascade,
  title text not null,
  due_date date not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  title text not null,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.prospects enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.history enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
for delete using (auth.uid() = id);

create policy "prospects_select_own" on public.prospects
for select using (auth.uid() = user_id);
create policy "prospects_insert_own" on public.prospects
for insert with check (auth.uid() = user_id);
create policy "prospects_update_own" on public.prospects
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "prospects_delete_own" on public.prospects
for delete using (auth.uid() = user_id);

create policy "notes_select_own" on public.notes
for select using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes
for insert with check (auth.uid() = user_id);
create policy "notes_update_own" on public.notes
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes
for delete using (auth.uid() = user_id);

create policy "tasks_select_own" on public.tasks
for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
for delete using (auth.uid() = user_id);

create policy "history_select_own" on public.history
for select using (auth.uid() = user_id);
create policy "history_insert_own" on public.history
for insert with check (auth.uid() = user_id);
create policy "history_update_own" on public.history
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "history_delete_own" on public.history
for delete using (auth.uid() = user_id);

create index if not exists profiles_team_id_idx on public.profiles(team_id);
create index if not exists prospects_user_id_idx on public.prospects(user_id);
create index if not exists prospects_team_id_idx on public.prospects(team_id);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists tasks_user_id_due_idx on public.tasks(user_id, due_date);
create index if not exists history_user_id_idx on public.history(user_id);
```

## Isolation des donnees

Chaque table contient `user_id`. Les policies RLS imposent que chaque utilisateur lise, ajoute, modifie et supprime uniquement ses propres lignes.

`role` et `team_id` sont deja presents pour un futur mode manager. Pour l'instant, l'application filtre volontairement par `user_id`.

## Deploiement Vercel

1. Pousser le projet sur GitHub.
2. Dans Vercel, cliquer sur New Project.
3. Importer le depot.
4. Verifier :
   - Framework Preset : Vite
   - Build Command : `npm run build`
   - Output Directory : `dist`
5. Ajouter les variables :
   - `VITE_SUPABASE_URL` = `https://gpvdofbrclnpodohkycw.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = votre Publishable Key Supabase
6. Cliquer sur Deploy.

## Fonctionnalites

- CRM avec fiches prospects completes
- Recherche et filtres avances
- Scoring Chaud / Tiede / Froid
- Pipeline RIMAN
- Relances automatiques via `tasks`
- Historique chronologique via `history`
- Notes prospects via `notes`
- Statistiques de conversion
- Bibliotheque de scripts et objections
- Page Mon compte
