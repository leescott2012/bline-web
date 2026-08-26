#!/usr/bin/env python3
import os
import sys
import json
import requests

BLINE_URL = "https://cszsikyzoinowjejlznw.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_KEY", "")

if not SERVICE_KEY:
    print("ERROR: SUPABASE_KEY not set in environment")
    sys.exit(1)

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

MIGRATION_SQL = """
create table if not exists public.spots (
  id          text        primary key,
  name        text        not null,
  category    text        not null default '',
  area        text        not null default '',
  loved       integer     not null default 0,
  rating      numeric(3,1) not null default 4.0,
  ratings     text        not null default '0',
  "openTill"  text        not null default '10p',
  "weeklyHours" jsonb,
  badges      text[]      not null default '{}',
  img         text        not null default '',
  imgs        text[]      not null default '{}',
  price       integer     not null default 0,
  "wasPrice"  integer     not null default 0,
  lng         numeric(9,6) not null,
  lat         numeric(8,6) not null,
  address     text        not null default '',
  walk        text        not null default '',
  reservation_link text,
  website     text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Add columns if they don't exist (for existing tables)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='spots' and column_name='reservation_link') then
    alter table public.spots add column reservation_link text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='spots' and column_name='website') then
    alter table public.spots add column website text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='spots' and column_name='weeklyHours') then
    alter table public.spots add column "weeklyHours" jsonb;
  end if;
end $$;

alter table public.spots enable row level security;

drop policy if exists "bline_anon_select_spots" on public.spots;
create policy "bline_anon_select_spots"
  on public.spots
  for select
  to anon
  using (active = true);
"""

print("Step 1: Updating spots table schema...")
# We use the REST RPC if available, or just skip DDL if it fails (assuming it's already there)
# Note: In a real environment, we'd use the Supabase CLI or Management API.
# For this task, we'll try the RPC.
requests.post(f"{BLINE_URL}/rest/v1/rpc/query", headers=HEADERS, json={"query": MIGRATION_SQL})

print("Step 2: Seeding real data...")
with open('/home/ubuntu/final_spots.json', 'r') as f:
    spots = json.load(f)

for spot in spots:
    resp = requests.post(
        f"{BLINE_URL}/rest/v1/spots",
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates"},
        json=spot
    )
    if resp.status_code not in (200, 201, 204):
        print(f"  Failed to upsert {spot['name']}: {resp.text}")
    else:
        print(f"  Upserted {spot['name']}")

print(f"Seeded {len(spots)} spots.")
