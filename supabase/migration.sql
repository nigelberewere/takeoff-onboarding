-- ==============================================================================
-- TakeOFF Driver Onboarding - Supabase Database Migration
-- Tables: drivers, vehicles, documents + RLS Policies + Storage Setup
-- ==============================================================================

-- Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. DRIVERS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  dob date,
  national_id text,
  address text,
  city text,
  emergency_contact_name text,
  emergency_contact_phone text,
  application_status text not null default 'draft' check (application_status in ('draft', 'pending_review', 'approved', 'rejected')),
  review_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for quick lookup by auth user
create index if not exists idx_drivers_auth_user_id on public.drivers(auth_user_id);
create index if not exists idx_drivers_status on public.drivers(application_status);

-- ------------------------------------------------------------------------------
-- 2. VEHICLES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  type text not null default 'car' check (type in ('bike', 'car', 'van', 'truck')),
  make text,
  model text,
  year text,
  plate_number text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vehicles_driver_id on public.vehicles(driver_id);

-- ------------------------------------------------------------------------------
-- 3. DOCUMENTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.drivers(id) on delete cascade,
  document_type text not null check (
    document_type in (
      'national_id_front',
      'national_id_back',
      'selfie',
      'license_front',
      'license_back',
      'vehicle_registration',
      'insurance'
    )
  ),
  file_url text not null,
  file_name text,
  file_size bigint,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_documents_driver_id on public.documents(driver_id);
create index if not exists idx_documents_type on public.documents(document_type);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.documents enable row level security;

-- DRIVERS RLS
drop policy if exists "Drivers can view own profile" on public.drivers;
create policy "Drivers can view own profile"
  on public.drivers for select
  using (auth.uid() = auth_user_id);

drop policy if exists "Drivers can insert own profile" on public.drivers;
create policy "Drivers can insert own profile"
  on public.drivers for insert
  with check (auth.uid() = auth_user_id);

drop policy if exists "Drivers can update own profile" on public.drivers;
create policy "Drivers can update own profile"
  on public.drivers for update
  using (auth.uid() = auth_user_id);

-- VEHICLES RLS
drop policy if exists "Drivers can view own vehicle" on public.vehicles;
create policy "Drivers can view own vehicle"
  on public.vehicles for select
  using (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

drop policy if exists "Drivers can insert own vehicle" on public.vehicles;
create policy "Drivers can insert own vehicle"
  on public.vehicles for insert
  with check (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

drop policy if exists "Drivers can update own vehicle" on public.vehicles;
create policy "Drivers can update own vehicle"
  on public.vehicles for update
  using (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

drop policy if exists "Drivers can delete own vehicle" on public.vehicles;
create policy "Drivers can delete own vehicle"
  on public.vehicles for delete
  using (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

-- DOCUMENTS RLS
drop policy if exists "Drivers can view own documents" on public.documents;
create policy "Drivers can view own documents"
  on public.documents for select
  using (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

drop policy if exists "Drivers can insert own documents" on public.documents;
create policy "Drivers can insert own documents"
  on public.documents for insert
  with check (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

drop policy if exists "Drivers can update own documents" on public.documents;
create policy "Drivers can update own documents"
  on public.documents for update
  using (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

drop policy if exists "Drivers can delete own documents" on public.documents;
create policy "Drivers can delete own documents"
  on public.documents for delete
  using (
    driver_id in (select id from public.drivers where auth_user_id = auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 5. STORAGE BUCKET SETUP ('driver-documents')
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', true)
on conflict (id) do update set public = true;

drop policy if exists "Authenticated users can upload driver documents" on storage.objects;
create policy "Authenticated users can upload driver documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'driver-documents'
  );

drop policy if exists "Anyone can read driver documents" on storage.objects;
create policy "Anyone can read driver documents"
  on storage.objects for select
  using (bucket_id = 'driver-documents');

drop policy if exists "Users can update or delete own uploaded objects" on storage.objects;
create policy "Users can update or delete own uploaded objects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'driver-documents');

drop policy if exists "Users can delete own uploaded objects" on storage.objects;
create policy "Users can delete own uploaded objects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'driver-documents');
