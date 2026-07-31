#!/usr/bin/env python3
"""
Seed the Supabase `spots` table with all 105 BeltLine businesses.

This script:
1. Creates the spots table (idempotent — safe to re-run)
2. Upserts all spots from the same source data as src/lib/data.ts

Requires SUPABASE_KEY (service role) in the environment.
Run: python3 scripts/seed-spots.py
"""

import os
import sys
import json
import math
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

# ── Step 1: Create the table via the Supabase Management API ─────────────────
# The REST API doesn't support DDL, so we use the pg_meta endpoint which
# the service role key can access.

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
  badges      text[]      not null default '{}',
  img         text        not null default '',
  imgs        text[]      not null default '{}',
  price       integer     not null default 0,
  "wasPrice"  integer     not null default 0,
  lng         numeric(9,6) not null,
  lat         numeric(8,6) not null,
  address     text        not null default '',
  walk        text        not null default '',
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.spots enable row level security;

drop policy if exists "bline_anon_select_spots" on public.spots;
create policy "bline_anon_select_spots"
  on public.spots
  for select
  to anon
  using (active = true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists spots_updated_at on public.spots;
create trigger spots_updated_at
  before update on public.spots
  for each row execute function public.set_updated_at();

create index if not exists spots_lat_lng on public.spots (lat, lng);
create index if not exists spots_area on public.spots (area);
"""

# Try the pg_meta SQL endpoint (available with service role)
print("Step 1: Creating spots table...")
resp = requests.post(
    f"{BLINE_URL}/rest/v1/rpc/query",
    headers=HEADERS,
    json={"query": MIGRATION_SQL},
)

if resp.status_code not in (200, 201, 204):
    # Try the direct SQL endpoint
    resp2 = requests.post(
        f"https://api.supabase.com/v1/projects/cszsikyzoinowjejlznw/database/query",
        headers={"Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": "application/json"},
        json={"query": MIGRATION_SQL},
    )
    if resp2.status_code not in (200, 201, 204):
        print(f"  DDL via rpc/query: {resp.status_code} {resp.text[:200]}")
        print(f"  DDL via mgmt API: {resp2.status_code} {resp2.text[:200]}")
        print("\n  NOTE: Cannot run DDL automatically. The migration SQL has been written to")
        print("  supabase-spots-migration.sql — run it manually in the Supabase SQL editor.")
        print("  Continuing with seeding (will fail if table doesn't exist yet)...")
    else:
        print(f"  Table created via management API: {resp2.status_code}")
else:
    print(f"  Table created: {resp.status_code}")

# ── Step 2: Generate the same spots as data.ts ────────────────────────────────

def hash_str(s: str) -> int:
    h = 0
    for c in s:
        h = (h * 31 + ord(c)) & 0x7FFFFFFF
    return h

def slug(name: str) -> str:
    import re
    return re.sub(r'(^-|-$)', '', re.sub(r'[^a-z0-9]+', '-', name.lower()))

CATEGORY_PHOTO = {
    "mexican": "/photos/tacos.png",
    "pizza": "/photos/pizza.png",
    "burger": "/photos/burger.png",
    "bbq": "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=60",
    "mediterranean": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=60",
    "indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=60",
    "coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=60",
    "bakery": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=60",
    "cocktail": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=60",
    "asian": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=60",
    "vegan": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=60",
    "sandwich": "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=900&q=60",
    "seafood": "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&q=60",
    "steakhouse": "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=900&q=60",
    "gelato": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=900&q=60",
    "brewery": "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=900&q=60",
    "bar": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=60",
    "korean": "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=900&q=60",
    "italian": "https://images.unsplash.com/photo-1498579485796-98be3abc076e?w=900&q=60",
    "friedchicken": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&q=60",
    "foodhall": "https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=900&q=60",
}

DAYTIME_CATS = {"coffee", "bakery", "gelato", "sandwich", "vegan"}

ZONES = {
    "midtown_connection": (-84.372, 33.782),
    "midtown_promenade": (-84.3715, 33.7815),
    "pcm_block": (-84.368, 33.771),
    "common_ground": (-84.3669, 33.7719),
    "fourth_ward": (-84.371, 33.767),
    "ralph_mcgill": (-84.373, 33.766),
    "inman_park_trail": (-84.3625, 33.7575),
    "krog_st": (-84.3636, 33.753),
    "ladybird_block": (-84.3644, 33.7616),
    "irwin_st": (-84.365, 33.759),
    "edgewood_ave": (-84.363, 33.755),
    "auburn_ave": (-84.373, 33.755),
    "dekalb_ave": (-84.36, 33.756),
    "wylie_st": (-84.361, 33.746),
    "inman_village": (-84.359, 33.762),
    "pcm_tenant": (-84.366, 33.7726),
    "krog_tenant": (-84.3636, 33.753),
    "pittsburgh_yards": (-84.403, 33.719),
    "capitol_view": (-84.416, 33.723),
    "allene_marketplace": (-84.42, 33.726),
    "lee_white": (-84.415, 33.735),
    "westview": (-84.443, 33.735),
}

# Core spots (hand-curated, from data.ts)
CORE_SPOTS = [
    {
        "id": "ponce-city",
        "name": "Ponce City Market",
        "category": "Food hall · 30+ vendors",
        "area": "O4W",
        "loved": 98,
        "rating": 4.8,
        "ratings": "2,504",
        "openTill": "11p",
        "badges": ["LOCAL FAVE", "PERKS"],
        "img": "/photos/ponce-card.png",
        "imgs": ["/photos/ponce-card.png", "/photos/ponce-wide.png"],
        "price": 96,
        "wasPrice": 161,
        "lng": -84.3660,
        "lat": 33.7726,
        "address": "675 Ponce De Leon Ave NE",
        "walk": "On the Eastside Trail",
    },
    {
        "id": "new-realm",
        "name": "New Realm Brewing",
        "category": "Brewery & Beer garden",
        "area": "Midtown",
        "loved": 95,
        "rating": 4.7,
        "ratings": "1,412",
        "openTill": "12a",
        "badges": ["TRAIL PICK", "DEAL"],
        "img": "/photos/new-realm-card.png",
        "imgs": ["/photos/new-realm-card.png", "/photos/new-realm-mural.png", "/photos/new-realm-hero.png"],
        "price": 135,
        "wasPrice": 191,
        "lng": -84.3669,
        "lat": 33.7719,
        "address": "550 Somerset Ter NE",
        "walk": "3 min walk from Ponce City Market",
    },
    {
        "id": "krog-street",
        "name": "Krog Street Market",
        "category": "Food hall · Local vendors",
        "area": "Inman Park",
        "loved": 93,
        "rating": 4.6,
        "ratings": "1,893",
        "openTill": "10p",
        "badges": ["TRAIL PICK"],
        "img": "https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=900&q=60",
        "imgs": ["https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=900&q=60"],
        "price": 130,
        "wasPrice": 164,
        "lng": -84.3636,
        "lat": 33.7530,
        "address": "99 Krog St NE",
        "walk": "1 min walk from Eastside Trail",
    },
    {
        "id": "lady-bird",
        "name": "Ladybird Grove & Mess Hall",
        "category": "Patio · American",
        "area": "O4W",
        "loved": 91,
        "rating": 4.5,
        "ratings": "987",
        "openTill": "11p",
        "badges": ["DEAL"],
        "img": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=60",
        "imgs": ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=60"],
        "price": 110,
        "wasPrice": 149,
        "lng": -84.3644,
        "lat": 33.7616,
        "address": "684 John Wesley Dobbs Ave",
        "walk": "Right on the trail",
    },
]

# Raw spots table: [name, category, area, photoKey, zoneKey, address]
RAW_SPOTS = [
    # Eastside Trail
    ("Arden's Garden", "Juice bar", "Midtown", "vegan", "midtown_connection", "985 Monroe Dr NE"),
    ("Mediterranean Grill", "Fast-casual Mediterranean", "Midtown", "mediterranean", "midtown_connection", "985 Monroe Dr NE"),
    ("Three Peaches Gelato and Coffee", "Gelato & coffee", "Midtown", "gelato", "midtown_connection", "985 Monroe Dr NE"),
    ("Apres Diem", "Cafe · Restaurant", "Midtown", "italian", "midtown_promenade", "931 Monroe Dr NE"),
    ("Desi Spice", "Indian", "Midtown", "indian", "midtown_promenade", "931 Monroe Dr NE"),
    ("The Independent", "Bar · Restaurant", "Midtown", "bar", "midtown_promenade", "931 Monroe Dr NE"),
    ("Mellow Mushroom", "Pizza", "Midtown", "pizza", "midtown_promenade", "931 Monroe Dr NE"),
    ("Metro Fresh", "Healthy fast-casual", "Midtown", "vegan", "midtown_promenade", "931 Monroe Dr NE"),
    ("Umma Kitchen", "Korean", "Midtown", "korean", "midtown_promenade", "931 Monroe Dr NE"),
    ("Rosso", "Italian-American", "Midtown", "italian", "midtown_promenade", "931 Monroe Dr NE"),
    ("Buddy Buddy", "Cocktail bar · Greek", "Midtown", "cocktail", "midtown_promenade", "931 Monroe Dr NE"),
    ("Indaco", "Upscale Italian", "O4W", "italian", "pcm_block", "725 Ponce De Leon Ave NE"),
    ("Rina", "Middle Eastern", "O4W", "mediterranean", "pcm_block", "699 Ponce De Leon Ave NE"),
    ("Rreal Tacos", "Mexican", "O4W", "mexican", "pcm_block", "699 Ponce De Leon Ave NE"),
    ("Three Taverns Ponce Brew Terminal", "Brewery · Beer bar", "O4W", "brewery", "pcm_block", "680 North Ave NE"),
    ("Atrium", "Cocktail bar", "O4W", "cocktail", "pcm_tenant", "Ponce City Market"),
    ("Azara", "Wellness restaurant", "O4W", "mediterranean", "common_ground", "550 Somerset Terrace NE"),
    ("Burle's Bar", "Cocktail lounge", "O4W", "cocktail", "fourth_ward", "505 N Angier Ave NE"),
    ("Casi Cielo", "Modern Mexican", "O4W", "mexican", "fourth_ward", "405 N Angier Ave NE"),
    ("Buena Vida Tapas", "Spanish tapas", "O4W", "mediterranean", "fourth_ward", "385 N Angier Ave NE"),
    ("Two Urban Licks", "Restaurant · Bar", "O4W", "steakhouse", "ralph_mcgill", "820 Ralph McGill Blvd NE"),
    ("Painted Park", "Sports bar", "Inman Park", "bar", "inman_park_trail", "240 N Highland Ave NE"),
    ("Kevin Rathbun Steak", "Steakhouse", "Inman Park", "steakhouse", "krog_st", "154 Krog St NE"),
    ("Superica", "Tex-Mex", "Inman Park", "mexican", "krog_tenant", "Krog Street Market"),
    ("Ticonderoga Club", "Cocktail bar · Restaurant", "Inman Park", "cocktail", "krog_tenant", "Krog Street Market"),
    ("Fred's Meat & Bread", "Sandwich shop", "Inman Park", "sandwich", "krog_tenant", "Krog Street Market"),
    ("Gu's Dumplings", "Dumplings", "Inman Park", "asian", "krog_tenant", "Krog Street Market"),
    ("Yalla", "Middle Eastern", "Inman Park", "mediterranean", "krog_tenant", "Krog Street Market"),
    ("Recess", "Bar · Lounge", "Inman Park", "bar", "krog_tenant", "Krog Street Market"),
    ("Hop City", "Beer & wine shop", "Inman Park", "brewery", "krog_tenant", "Krog Street Market"),
    ("Five Daughters Bakery", "Bakery", "O4W", "bakery", "pcm_tenant", "Ponce City Market"),
    ("9 Mile Station", "Restaurant", "O4W", "foodhall", "pcm_tenant", "Ponce City Market"),
    ("H&F Burger", "Burgers", "O4W", "burger", "pcm_tenant", "Ponce City Market"),
    ("Minero", "Mexican", "O4W", "mexican", "pcm_tenant", "Ponce City Market"),
    ("Hop's Chicken", "Fried chicken", "O4W", "friedchicken", "pcm_tenant", "Ponce City Market"),
    ("Honeysuckle Gelato", "Gelato", "O4W", "gelato", "pcm_tenant", "Ponce City Market"),
    ("Ranger Station", "Speakeasy cocktail bar", "O4W", "cocktail", "ladybird_block", "684 John Wesley Dobbs Ave NE"),
    ("Lingering Shade Social Club", "Cocktail bar", "O4W", "cocktail", "irwin_st", "660 Irwin St NE"),
    ("Chiringa", "Beach food", "O4W", "seafood", "edgewood_ave", "678 Edgewood Ave NE"),
    ("Eclipse di Luna", "Tapas", "O4W", "mediterranean", "auburn_ave", "661 Auburn Ave NE"),
    ("Emerald City Bagels", "Bagel shop", "O4W", "bakery", "auburn_ave", "665 Auburn Ave NE"),
    ("Glide Pizza", "NY-style pizza", "O4W", "pizza", "auburn_ave", "699 Auburn Ave NE"),
    ("Hawkers", "Asian street food", "O4W", "asian", "auburn_ave", "661 Auburn Ave NE"),
    ("The James Room", "Cafe · Cocktail bar", "O4W", "cocktail", "auburn_ave", "661 Auburn Ave NE"),
    ("Northern China Eatery", "Chinese", "O4W", "asian", "auburn_ave", "665 Auburn Ave NE"),
    ("Popup Bagels", "Bagel shop", "O4W", "bakery", "auburn_ave", "661 Auburn Ave NE"),
    ("Pour Taproom", "Self-serve beer & wine", "O4W", "brewery", "auburn_ave", "661 Auburn Ave NE"),
    ("Yeppa", "Italian", "O4W", "italian", "auburn_ave", "667 Auburn Ave NE"),
    ("Yuji Modern Japanese", "Sushi · Japanese", "O4W", "asian", "auburn_ave", "667 Auburn Ave NE"),
    ("Guac y Margys", "Tex-Mex", "O4W", "mexican", "auburn_ave", "661 Auburn Ave NE"),
    ("Nina & Rafi", "Detroit-style pizza", "O4W", "pizza", "auburn_ave", "661 Auburn Ave NE"),
    ("McCray's Tavern", "Sports bar", "Reynoldstown", "bar", "dekalb_ave", "670 DeKalb Ave NE"),
    ("Cold Beer", "New American", "Reynoldstown", "bar", "dekalb_ave", "670 DeKalb Ave NE"),
    ("Estrella", "Brasserie · Rooftop bar", "O4W", "cocktail", "common_ground", "550 Somerset Terrace NE"),
    ("Breaker Breaker", "Fried seafood", "Cabbagetown", "seafood", "wylie_st", "921 Wylie St SE"),
    ("Delbar", "Middle Eastern", "Inman Park", "mediterranean", "inman_village", "870 Inman Village Pkwy NE"),
    # Southwest Trail — Pittsburgh Yards
    ("Coffyn Pyes", "Savory hand pies", "Pittsburgh Yards", "bakery", "pittsburgh_yards", "Pittsburgh Yards"),
    ("The Creamy Spot", "Plant-based ice cream", "Pittsburgh Yards", "gelato", "pittsburgh_yards", "Pittsburgh Yards"),
    ("Urban Grind BrewBox", "Coffee shop", "Pittsburgh Yards", "coffee", "pittsburgh_yards", "Pittsburgh Yards"),
    ("Carrot Dog", "Vegan hot dogs", "Pittsburgh Yards", "vegan", "pittsburgh_yards", "Pittsburgh Yards"),
    # Southwest Trail — Capitol View
    ("Mr. Diddy's", "Southern fusion", "Capitol View", "friedchicken", "capitol_view", "Koncept House"),
    ("Everythang NOLA & Buku Bowls", "New Orleans · Acai cafe", "Capitol View", "vegan", "capitol_view", "Capitol View"),
    ("The Bougie Grazer", "Charcuterie", "Capitol View", "sandwich", "capitol_view", "Capitol View"),
    ("Brew Bar Atlanta", "Coffee shop", "Capitol View", "coffee", "capitol_view", "Capitol View"),
    ("Perch", "Cocktail bar", "Capitol View", "cocktail", "capitol_view", "Koncept House"),
    ("Black Coffee", "Coffee shop", "Capitol View", "coffee", "capitol_view", "Capitol View"),
    # Southwest Trail — Allene Marketplace
    ("Good As Burgers", "Vegan burgers", "Allene Marketplace", "burger", "allene_marketplace", "Allene Marketplace"),
    ("Glacier's Italian Ice", "Italian ice", "Allene Marketplace", "gelato", "allene_marketplace", "Allene Marketplace"),
    # Southwest / Westside Trail — Lee + White
    ("Monday Night Brewing – The Garage", "Brewery", "West End", "brewery", "lee_white", "Lee + White"),
    ("ASW Whiskey Exchange", "Whiskey barrelhouse", "West End", "cocktail", "lee_white", "Lee + White"),
    ("Boxcar", "Restaurant · Bar", "West End", "bar", "lee_white", "1000 White St SW"),
    ("Hop City Bar", "Beer bar", "West End", "brewery", "lee_white", "Lee + White"),
    ("Bovino After Dark", "Fine dining", "West End", "steakhouse", "lee_white", "Lee + White"),
    ("Wild Heaven Beer: West End", "Brewery", "West End", "brewery", "lee_white", "1010 White St SW"),
    ("Eats", "Meat-and-three", "West End", "bbq", "lee_white", "Lee + White"),
    ("Notable Roasting", "Coffee shop", "West End", "coffee", "lee_white", "Lee + White"),
    ("Atlanta Golf and Social West End", "Golf sim · Bar", "West End", "bar", "lee_white", "Lee + White"),
    ("Costa Coffee", "Coffee chain", "West End", "coffee", "lee_white", "Lee + White"),
    ("gusto!", "Build-your-own bowls", "West End", "vegan", "lee_white", "Lee + White"),
    ("Strangers in Paradise", "Tiki cocktail bar", "West End", "cocktail", "lee_white", "1020 White St SW"),
    ("Cielito Lindo Taqueria & Creme de la Crepe", "Mexican · Crepes", "West End", "mexican", "lee_white", "Lee + White"),
    ("Gekko Kitchen", "Japanese", "West End", "asian", "lee_white", "Lee + White"),
    ("Good Azz Burgerz", "Burgers", "West End", "burger", "lee_white", "1020 White St SW"),
    ("Honeysuckle Gelato West End", "Gelato", "West End", "gelato", "lee_white", "Lee + White"),
    ("One Korean Bistro", "Korean", "West End", "korean", "lee_white", "Lee + White"),
    ("Original Hot Dog Factory", "Hot dogs", "West End", "friedchicken", "lee_white", "Lee + White"),
    ("Sakura Sake Bar", "Cocktail bar", "West End", "cocktail", "lee_white", "Lee + White"),
    ("Sirocco Westside Deli", "Sandwich shop", "West End", "sandwich", "lee_white", "Lee + White"),
    ("Sweet Red Peach", "Bakery", "West End", "bakery", "lee_white", "Lee + White"),
    ("Vietvana Pho Noodle House", "Vietnamese", "West End", "asian", "lee_white", "Lee + White"),
    ("World of Chicken", "Korean fried chicken", "West End", "friedchicken", "lee_white", "Lee + White"),
    ("El Tesoro West End", "Mexican", "West End", "mexican", "lee_white", "Lee + White"),
    ("Cultured South Fermentation Co.", "Kombucha taproom", "West End", "vegan", "lee_white", "1038 White St SW"),
    ("Atlanta Food Truck Park", "Food truck park", "West End", "foodhall", "lee_white", "Lee + White"),
    ("Bogg's Social and Supply", "Bar · Music venue", "West End", "bar", "lee_white", "1310 White St SW"),
    ("Best End Brewing", "Brewery", "West End", "brewery", "lee_white", "1036 White St SW"),
    # Southwest Trail — Westview
    ("404 Grounds", "Coffee shop", "Westview", "coffee", "westview", "Ke'nekt Cooperative"),
    ("The Westwood", "Bar · Restaurant", "Westview", "bar", "westview", "Westview"),
    ("Firewall", "Wood-fired pizza", "Westview", "pizza", "westview", "Westview"),
    ("D Cafe and Catering", "Southern", "Westview", "bbq", "westview", "Westview"),
    ("BBQ 56", "Barbecue", "Westview", "bbq", "westview", "Westview"),
]

def jitter(name: str, seed: int) -> float:
    return ((hash_str(name + str(seed)) % 1000) / 1000 - 0.5) * 0.003

def generate_spot(name, category, area, photo_key, zone_key, address):
    h = hash_str(name)
    base_lng, base_lat = ZONES[zone_key]
    img = CATEGORY_PHOTO.get(photo_key, CATEGORY_PHOTO["foodhall"])
    rating = round((4.1 + (h % 9) / 10) * 10) / 10
    badges = []
    if h % 5 == 0:
        badges.append("TRAIL PICK")
    elif h % 5 == 1:
        badges.append("LOCAL FAVE")
    if h % 7 == 0:
        badges.append("DEAL")

    if area in ("West End", "Westview"):
        walk = "Near the Westside Trail"
    elif area in ("Pittsburgh Yards", "Capitol View", "Allene Marketplace"):
        walk = "Near the Southwest Trail"
    else:
        walk = "On the Eastside Trail"

    open_till_options = ["5p", "6p", "7p"] if photo_key in DAYTIME_CATS else ["10p", "11p", "12a", "1a"]
    open_till = open_till_options[h % len(open_till_options)]

    return {
        "id": slug(name),
        "name": name,
        "category": category,
        "area": area,
        "loved": 80 + (h % 19),
        "rating": rating,
        "ratings": str(300 + (h % 2200)),
        "openTill": open_till,
        "badges": badges,
        "img": img,
        "imgs": [img],
        "price": 60 + (h % 120),
        "wasPrice": 60 + (h % 120) + 20 + (h % 60),
        "lng": round(base_lng + jitter(name, 1), 6),
        "lat": round(base_lat + jitter(name, 2), 6),
        "address": address,
        "walk": walk,
        "active": True,
    }

# Build full spots list
all_spots = list(CORE_SPOTS)
for raw in RAW_SPOTS:
    all_spots.append(generate_spot(*raw))

# CORE_SPOTS entries omit "active" (generate_spot() sets it) -- PostgREST's bulk
# insert requires every object in a batch to share the exact same key set.
for spot in all_spots:
    spot.setdefault("active", True)

print(f"  Generated {len(all_spots)} spots total")

# ── Step 3: Upsert all spots ──────────────────────────────────────────────────
print(f"\nStep 2: Upserting {len(all_spots)} spots into Supabase...")

UPSERT_HEADERS = {
    **HEADERS,
    "Prefer": "resolution=merge-duplicates,return=minimal",
}

# Upsert in batches of 50
BATCH_SIZE = 50
success_count = 0
for i in range(0, len(all_spots), BATCH_SIZE):
    batch = all_spots[i:i + BATCH_SIZE]
    resp = requests.post(
        f"{BLINE_URL}/rest/v1/spots",
        headers=UPSERT_HEADERS,
        json=batch,
    )
    if resp.status_code in (200, 201, 204):
        success_count += len(batch)
        print(f"  Batch {i//BATCH_SIZE + 1}: {len(batch)} spots upserted (status {resp.status_code})")
    else:
        print(f"  Batch {i//BATCH_SIZE + 1} FAILED: {resp.status_code} {resp.text[:300]}")

print(f"\nDone: {success_count}/{len(all_spots)} spots seeded.")

# ── Step 4: Verify ────────────────────────────────────────────────────────────
print("\nStep 3: Verifying...")
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzenNpa3l6b2lub3dqZWpsem53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzA1MDksImV4cCI6MjEwMDMwNjUwOX0.nUiglVtCUVesTRQE6bvyuQgSIGICXMPnog5aq3LC6iw"
verify_resp = requests.get(
    f"{BLINE_URL}/rest/v1/spots?select=id,name&limit=5",
    headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
    },
)
if verify_resp.status_code == 200:
    data = verify_resp.json()
    print(f"  Anon read OK — first {len(data)} spots: {[s['name'] for s in data]}")
else:
    print(f"  Anon read failed: {verify_resp.status_code} {verify_resp.text[:200]}")

count_resp = requests.get(
    f"{BLINE_URL}/rest/v1/spots?select=id",
    headers={
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Prefer": "count=exact",
        "Range": "0-0",
    },
)
if count_resp.status_code in (200, 206):
    content_range = count_resp.headers.get("Content-Range", "unknown")
    print(f"  Total spots in table: {content_range}")
