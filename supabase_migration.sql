-- ============================================
-- SUPABASE MIGRATION — CareConnect
-- ============================================
-- Run this in Supabase Dashboard → SQL Editor
-- Creates all tables, RLS policies, and seed data.

-- ─── PROFILES (linked to auth.users) ───

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  phone text,
  role text not null default 'user' check (role in ('user', 'nurse', 'admin', 'shelter')),
  location text,
  google_id text,
  profile_photo text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── NURSE PROFILES ───

create table if not exists public.nurse_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  specializations text[] default '{}',
  experience integer default 0,
  hourly_rate numeric default 0,
  bio text default '',
  location text default '',
  service_areas text[] default '{}',
  availability boolean default true,
  verification_status text default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  rating numeric default 0,
  total_reviews integer default 0,
  profile_photo text,
  created_at timestamptz default now()
);

alter table public.nurse_profiles enable row level security;

create policy "Nurse profiles are viewable by everyone"
  on public.nurse_profiles for select using (true);

create policy "Nurses can update own profile"
  on public.nurse_profiles for update using (auth.uid() = user_id);

create policy "Nurses can insert own profile"
  on public.nurse_profiles for insert with check (auth.uid() = user_id);

-- ─── NURSE DOCUMENTS ───

create table if not exists public.nurse_documents (
  id uuid primary key default gen_random_uuid(),
  nurse_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_data text, -- base64
  document_type text default 'other' check (document_type in ('certificate', 'government_id', 'license', 'other')),
  ai_analysis jsonb,
  uploaded_at timestamptz default now()
);

alter table public.nurse_documents enable row level security;

create policy "Documents viewable by owner and admins"
  on public.nurse_documents for select using (
    auth.uid() = nurse_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Nurses can insert own documents"
  on public.nurse_documents for insert with check (auth.uid() = nurse_id);

create policy "Nurses can delete own documents"
  on public.nurse_documents for delete using (auth.uid() = nurse_id);

create policy "Admins can update documents"
  on public.nurse_documents for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or auth.uid() = nurse_id
  );

-- ─── BOOKINGS ───

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nurse_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  nurse_name text not null,
  service_type text not null,
  start_date text not null,
  end_date text not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  payment_method text default 'cod' check (payment_method in ('cod', 'online')),
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed')),
  total_amount numeric default 0,
  notes text default '',
  nurse_phone text,
  feedback jsonb,
  payment_status text check (payment_status in ('pending', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- ─── NOTIFICATIONS ───

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- Admins/System can insert notifications
create policy "Admins can insert notifications"
  on public.notifications for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on public.bookings for select using (
    auth.uid() = user_id or auth.uid() = nurse_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can create bookings"
  on public.bookings for insert with check (auth.uid() = user_id);

create policy "Booking participants can update"
  on public.bookings for update using (
    auth.uid() = user_id or auth.uid() = nurse_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── SHELTERS ───

create table if not exists public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude numeric not null,
  longitude numeric not null,
  phone text,
  email text,
  capacity integer default 0,
  shelter_user_id uuid references public.profiles(id) on delete set null
);

alter table public.shelters enable row level security;

create policy "Shelters are viewable by everyone"
  on public.shelters for select using (true);

create policy "Admins can manage shelters"
  on public.shelters for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Shelter users can insert own shelter"
  on public.shelters for insert with check (auth.uid() = shelter_user_id);

-- ─── SHELTER REPORTS ───

create table if not exists public.shelter_reports (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid not null references public.profiles(id) on delete cascade,
  reporter_name text not null,
  photo text, -- base64
  latitude numeric not null,
  longitude numeric not null,
  location_description text default '',
  description text default '',
  nearby_shelters jsonb default '[]',
  status text default 'reported' check (status in ('reported', 'notified', 'resolved')),
  created_at timestamptz default now()
);

alter table public.shelter_reports enable row level security;

create policy "Reports viewable by reporter and admins"
  on public.shelter_reports for select using (
    auth.uid() = reported_by or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can create reports"
  on public.shelter_reports for insert with check (auth.uid() = reported_by);

create policy "Admins can update reports"
  on public.shelter_reports for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── NOTIFICATIONS ───

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'error')),
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "System can create notifications"
  on public.notifications for insert with check (true);

create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- ─── SEED DATA: SHELTERS ───

insert into public.shelters (name, address, latitude, longitude, phone, email, capacity) values
  ('Sneha Bhavan Shelter', 'MG Road, Kochi, Kerala', 9.9312, 76.2673, '0484-2345678', 'sneha@shelter.org', 100),
  ('Ashraya Care Home', 'Pattom, Thiruvananthapuram, Kerala', 8.5241, 76.9366, '0471-2345678', 'ashraya@shelter.org', 75),
  ('Sahaya Trust Kozhikode', 'SM Street, Kozhikode, Kerala', 11.2588, 75.7804, '0495-2345678', 'sahaya@shelter.org', 50),
  ('Karunya Foundation', 'Swaraj Round, Thrissur, Kerala', 10.5276, 76.2144, '0487-2345678', 'karunya@shelter.org', 60),
  ('Pratheeksha Shelter', 'Chinnakada, Kollam, Kerala', 8.8932, 76.6141, '0474-2345678', 'pratheeksha@shelter.org', 80)
on conflict do nothing;

-- ─── HELPER: Auto-create profile on signup ───

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, phone, role, location)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'location', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- ADMIN LOGS (audit trail)
-- ============================================

create table if not exists public.admin_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references auth.users(id) on delete set null,
  admin_name text not null,
  action text not null,
  target text not null,
  details text not null default '',
  created_at timestamptz default now()
);

alter table public.admin_logs enable row level security;

create policy "Admins can read all logs"
  on public.admin_logs for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can insert logs"
  on public.admin_logs for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
