export type Spot = {
  id: string;
  name: string;
  category: string;
  area: string;
  loved: number;
  rating: number;
  ratings: string;
  openTill: string;
  badges: string[];
  img: string;
  imgs: string[];
  price: number;
  wasPrice: number;
  lng: number;
  lat: number;
  address: string;
  walk: string;
};

// ponytail: mock data only — swap for Supabase when the backend lands
const coreSpots: Spot[] = [
  {
    id: "ponce-city",
    name: "Ponce City Market",
    category: "Food hall · 30+ vendors",
    area: "O4W",
    loved: 98,
    rating: 4.8,
    ratings: "2,504",
    openTill: "11p",
    badges: ["LOCAL FAVE", "PERKS"],
    img: "/photos/ponce-card.png",
    imgs: ["/photos/ponce-card.png", "/photos/ponce-wide.png"],
    price: 96,
    wasPrice: 161,
    lng: -84.3660,
    lat: 33.7726,
address: "675 Ponce De Leon Ave NE",
    walk: "On the Eastside Trail",
  },
  {
    id: "new-realm",
    name: "New Realm Brewing",
    category: "Brewery & Beer garden",
    area: "Midtown",
    loved: 95,
    rating: 4.7,
    ratings: "1,412",
    openTill: "12a",
    badges: ["TRAIL PICK", "DEAL"],
    img: "/photos/new-realm-card.png",
    imgs: ["/photos/new-realm-card.png", "/photos/new-realm-mural.png", "/photos/new-realm-hero.png"],
    price: 135,
    wasPrice: 191,
    lng: -84.3669,
    lat: 33.7719,
address: "550 Somerset Ter NE",
    walk: "3 min walk from Ponce City Market",
  },
  {
    id: "krog-street",
    name: "Krog Street Market",
    category: "Food hall · Local vendors",
    area: "Inman Park",
    loved: 93,
    rating: 4.6,
    ratings: "1,893",
    openTill: "10p",
    badges: ["TRAIL PICK"],
    img: "https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=900&q=60",
    imgs: ["https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=900&q=60"],
    price: 130,
    wasPrice: 164,
    lng: -84.3636,
    lat: 33.7530,
address: "99 Krog St NE",
    walk: "1 min walk from Eastside Trail",
  },
  {
    id: "lady-bird",
    name: "Ladybird Grove & Mess Hall",
    category: "Patio · American",
    area: "O4W",
    loved: 91,
    rating: 4.5,
    ratings: "987",
    openTill: "11p",
    badges: ["DEAL"],
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=60",
    imgs: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=60"],
    price: 110,
    wasPrice: 149,
    lng: -84.3644,
    lat: 33.7616,
address: "684 John Wesley Dobbs Ave",
    walk: "Right on the trail",
  },
];

// Real, named BeltLine-area businesses sourced from beltline.org's shopping/dining
// guide, AJC's Eastside + Southwest Trail restaurant guides, and Atlanta Eats —
// generated from a compact table instead of ~100 hand-typed objects. Excludes
// generic chain clusters (e.g. Kroger Citi Center fast food) and multi-tenant
// developments with no individually named tenants.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const CATEGORY_PHOTO: Record<string, string> = {
  mexican: "/photos/tacos.png",
  pizza: "/photos/pizza.png",
  burger: "/photos/burger.png",
  bbq: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=60",
  mediterranean: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=60",
  indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=60",
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=60",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=60",
  cocktail: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=60",
  asian: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=60",
  vegan: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=60",
  sandwich: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=900&q=60",
  seafood: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&q=60",
  steakhouse: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=900&q=60",
  gelato: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=900&q=60",
  brewery: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=900&q=60",
  bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&q=60",
  korean: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=900&q=60",
  italian: "https://images.unsplash.com/photo-1498579485796-98be3abc076e?w=900&q=60",
  friedchicken: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&q=60",
  foodhall: "https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?w=900&q=60",
};
const DAYTIME_CATS = new Set(["coffee", "bakery", "gelato", "sandwich", "vegan"]);

const ZONES: Record<string, [number, number]> = {
  midtown_connection: [-84.372, 33.782],
  midtown_promenade: [-84.3715, 33.7815],
  pcm_block: [-84.368, 33.771],
  common_ground: [-84.3669, 33.7719],
  fourth_ward: [-84.371, 33.767],
  ralph_mcgill: [-84.373, 33.766],
  inman_park_trail: [-84.3625, 33.7575],
  krog_st: [-84.3636, 33.753],
  ladybird_block: [-84.3644, 33.7616],
  irwin_st: [-84.365, 33.759],
  edgewood_ave: [-84.363, 33.755],
  auburn_ave: [-84.373, 33.755],
  dekalb_ave: [-84.36, 33.756],
  wylie_st: [-84.361, 33.746],
  inman_village: [-84.359, 33.762],
  pcm_tenant: [-84.366, 33.7726],
  krog_tenant: [-84.3636, 33.753],
  pittsburgh_yards: [-84.403, 33.719],
  capitol_view: [-84.416, 33.723],
  allene_marketplace: [-84.42, 33.726],
  lee_white: [-84.415, 33.735],
  westview: [-84.443, 33.735],
};

// [name, category label, area label, photo key, zone key, address]
const RAW_SPOTS: [string, string, string, string, string, string][] = [
  // Eastside Trail
  ["Arden's Garden", "Juice bar", "Midtown", "vegan", "midtown_connection", "985 Monroe Dr NE"],
  ["Mediterranean Grill", "Fast-casual Mediterranean", "Midtown", "mediterranean", "midtown_connection", "985 Monroe Dr NE"],
  ["Three Peaches Gelato and Coffee", "Gelato & coffee", "Midtown", "gelato", "midtown_connection", "985 Monroe Dr NE"],
  ["Apres Diem", "Cafe · Restaurant", "Midtown", "italian", "midtown_promenade", "931 Monroe Dr NE"],
  ["Desi Spice", "Indian", "Midtown", "indian", "midtown_promenade", "931 Monroe Dr NE"],
  ["The Independent", "Bar · Restaurant", "Midtown", "bar", "midtown_promenade", "931 Monroe Dr NE"],
  ["Mellow Mushroom", "Pizza", "Midtown", "pizza", "midtown_promenade", "931 Monroe Dr NE"],
  ["Metro Fresh", "Healthy fast-casual", "Midtown", "vegan", "midtown_promenade", "931 Monroe Dr NE"],
  ["Umma Kitchen", "Korean", "Midtown", "korean", "midtown_promenade", "931 Monroe Dr NE"],
  ["Rosso", "Italian-American", "Midtown", "italian", "midtown_promenade", "931 Monroe Dr NE"],
  ["Buddy Buddy", "Cocktail bar · Greek", "Midtown", "cocktail", "midtown_promenade", "931 Monroe Dr NE"],
  ["Indaco", "Upscale Italian", "O4W", "italian", "pcm_block", "725 Ponce De Leon Ave NE"],
  ["Rina", "Middle Eastern", "O4W", "mediterranean", "pcm_block", "699 Ponce De Leon Ave NE"],
  ["Rreal Tacos", "Mexican", "O4W", "mexican", "pcm_block", "699 Ponce De Leon Ave NE"],
  ["Three Taverns Ponce Brew Terminal", "Brewery · Beer bar", "O4W", "brewery", "pcm_block", "680 North Ave NE"],
  ["Atrium", "Cocktail bar", "O4W", "cocktail", "pcm_tenant", "Ponce City Market"],
  ["Azara", "Wellness restaurant", "O4W", "mediterranean", "common_ground", "550 Somerset Terrace NE"],
  ["Burle's Bar", "Cocktail lounge", "O4W", "cocktail", "fourth_ward", "505 N Angier Ave NE"],
  ["Casi Cielo", "Modern Mexican", "O4W", "mexican", "fourth_ward", "405 N Angier Ave NE"],
  ["Buena Vida Tapas", "Spanish tapas", "O4W", "mediterranean", "fourth_ward", "385 N Angier Ave NE"],
  ["Two Urban Licks", "Restaurant · Bar", "O4W", "steakhouse", "ralph_mcgill", "820 Ralph McGill Blvd NE"],
  ["Painted Park", "Sports bar", "Inman Park", "bar", "inman_park_trail", "240 N Highland Ave NE"],
  ["Kevin Rathbun Steak", "Steakhouse", "Inman Park", "steakhouse", "krog_st", "154 Krog St NE"],
  ["Superica", "Tex-Mex", "Inman Park", "mexican", "krog_tenant", "Krog Street Market"],
  ["Ticonderoga Club", "Cocktail bar · Restaurant", "Inman Park", "cocktail", "krog_tenant", "Krog Street Market"],
  ["Fred's Meat & Bread", "Sandwich shop", "Inman Park", "sandwich", "krog_tenant", "Krog Street Market"],
  ["Gu's Dumplings", "Dumplings", "Inman Park", "asian", "krog_tenant", "Krog Street Market"],
  ["Yalla", "Middle Eastern", "Inman Park", "mediterranean", "krog_tenant", "Krog Street Market"],
  ["Recess", "Bar · Lounge", "Inman Park", "bar", "krog_tenant", "Krog Street Market"],
  ["Hop City", "Beer & wine shop", "Inman Park", "brewery", "krog_tenant", "Krog Street Market"],
  ["Five Daughters Bakery", "Bakery", "O4W", "bakery", "pcm_tenant", "Ponce City Market"],
  ["9 Mile Station", "Restaurant", "O4W", "foodhall", "pcm_tenant", "Ponce City Market"],
  ["H&F Burger", "Burgers", "O4W", "burger", "pcm_tenant", "Ponce City Market"],
  ["Minero", "Mexican", "O4W", "mexican", "pcm_tenant", "Ponce City Market"],
  ["Hop's Chicken", "Fried chicken", "O4W", "friedchicken", "pcm_tenant", "Ponce City Market"],
  ["Honeysuckle Gelato", "Gelato", "O4W", "gelato", "pcm_tenant", "Ponce City Market"],
  ["Ranger Station", "Speakeasy cocktail bar", "O4W", "cocktail", "ladybird_block", "684 John Wesley Dobbs Ave NE"],
  ["Lingering Shade Social Club", "Cocktail bar", "O4W", "cocktail", "irwin_st", "660 Irwin St NE"],
  ["Chiringa", "Beach food", "O4W", "seafood", "edgewood_ave", "678 Edgewood Ave NE"],
  ["Eclipse di Luna", "Tapas", "O4W", "mediterranean", "auburn_ave", "661 Auburn Ave NE"],
  ["Emerald City Bagels", "Bagel shop", "O4W", "bakery", "auburn_ave", "665 Auburn Ave NE"],
  ["Glide Pizza", "NY-style pizza", "O4W", "pizza", "auburn_ave", "699 Auburn Ave NE"],
  ["Hawkers", "Asian street food", "O4W", "asian", "auburn_ave", "661 Auburn Ave NE"],
  ["The James Room", "Cafe · Cocktail bar", "O4W", "cocktail", "auburn_ave", "661 Auburn Ave NE"],
  ["Northern China Eatery", "Chinese", "O4W", "asian", "auburn_ave", "665 Auburn Ave NE"],
  ["Popup Bagels", "Bagel shop", "O4W", "bakery", "auburn_ave", "661 Auburn Ave NE"],
  ["Pour Taproom", "Self-serve beer & wine", "O4W", "brewery", "auburn_ave", "661 Auburn Ave NE"],
  ["Yeppa", "Italian", "O4W", "italian", "auburn_ave", "667 Auburn Ave NE"],
  ["Yuji Modern Japanese", "Sushi · Japanese", "O4W", "asian", "auburn_ave", "667 Auburn Ave NE"],
  ["Guac y Margys", "Tex-Mex", "O4W", "mexican", "auburn_ave", "661 Auburn Ave NE"],
  ["Nina & Rafi", "Detroit-style pizza", "O4W", "pizza", "auburn_ave", "661 Auburn Ave NE"],
  ["McCray's Tavern", "Sports bar", "Reynoldstown", "bar", "dekalb_ave", "670 DeKalb Ave NE"],
  ["Cold Beer", "New American", "Reynoldstown", "bar", "dekalb_ave", "670 DeKalb Ave NE"],
  ["Estrella", "Brasserie · Rooftop bar", "O4W", "cocktail", "common_ground", "550 Somerset Terrace NE"],
  ["Breaker Breaker", "Fried seafood", "Cabbagetown", "seafood", "wylie_st", "921 Wylie St SE"],
  ["Delbar", "Middle Eastern", "Inman Park", "mediterranean", "inman_village", "870 Inman Village Pkwy NE"],

  // Southwest Trail — Pittsburgh Yards
  ["Coffyn Pyes", "Savory hand pies", "Pittsburgh Yards", "bakery", "pittsburgh_yards", "Pittsburgh Yards"],
  ["The Creamy Spot", "Plant-based ice cream", "Pittsburgh Yards", "gelato", "pittsburgh_yards", "Pittsburgh Yards"],
  ["Urban Grind BrewBox", "Coffee shop", "Pittsburgh Yards", "coffee", "pittsburgh_yards", "Pittsburgh Yards"],
  ["Carrot Dog", "Vegan hot dogs", "Pittsburgh Yards", "vegan", "pittsburgh_yards", "Pittsburgh Yards"],

  // Southwest Trail — Capitol View
  ["Mr. Diddy's", "Southern fusion", "Capitol View", "friedchicken", "capitol_view", "Koncept House"],
  ["Everythang NOLA & Buku Bowls", "New Orleans · Acai cafe", "Capitol View", "vegan", "capitol_view", "Capitol View"],
  ["The Bougie Grazer", "Charcuterie", "Capitol View", "sandwich", "capitol_view", "Capitol View"],
  ["Brew Bar Atlanta", "Coffee shop", "Capitol View", "coffee", "capitol_view", "Capitol View"],
  ["Perch", "Cocktail bar", "Capitol View", "cocktail", "capitol_view", "Koncept House"],
  ["Black Coffee", "Coffee shop", "Capitol View", "coffee", "capitol_view", "Capitol View"],

  // Southwest Trail — Allene Marketplace
  ["Good As Burgers", "Vegan burgers", "Allene Marketplace", "burger", "allene_marketplace", "Allene Marketplace"],
  ["Glacier's Italian Ice", "Italian ice", "Allene Marketplace", "gelato", "allene_marketplace", "Allene Marketplace"],

  // Southwest / Westside Trail — Lee + White
  ["Monday Night Brewing – The Garage", "Brewery", "West End", "brewery", "lee_white", "Lee + White"],
  ["ASW Whiskey Exchange", "Whiskey barrelhouse", "West End", "cocktail", "lee_white", "Lee + White"],
  ["Boxcar", "Restaurant · Bar", "West End", "bar", "lee_white", "1000 White St SW"],
  ["Hop City Bar", "Beer bar", "West End", "brewery", "lee_white", "Lee + White"],
  ["Bovino After Dark", "Fine dining", "West End", "steakhouse", "lee_white", "Lee + White"],
  ["Wild Heaven Beer: West End", "Brewery", "West End", "brewery", "lee_white", "1010 White St SW"],
  ["Eats", "Meat-and-three", "West End", "bbq", "lee_white", "Lee + White"],
  ["Notable Roasting", "Coffee shop", "West End", "coffee", "lee_white", "Lee + White"],
  ["Atlanta Golf and Social West End", "Golf sim · Bar", "West End", "bar", "lee_white", "Lee + White"],
  ["Costa Coffee", "Coffee chain", "West End", "coffee", "lee_white", "Lee + White"],
  ["gusto!", "Build-your-own bowls", "West End", "vegan", "lee_white", "Lee + White"],
  ["Strangers in Paradise", "Tiki cocktail bar", "West End", "cocktail", "lee_white", "1020 White St SW"],
  ["Cielito Lindo Taqueria & Creme de la Crepe", "Mexican · Crepes", "West End", "mexican", "lee_white", "Lee + White"],
  ["Gekko Kitchen", "Japanese", "West End", "asian", "lee_white", "Lee + White"],
  ["Good Azz Burgerz", "Burgers", "West End", "burger", "lee_white", "1020 White St SW"],
  ["Honeysuckle Gelato West End", "Gelato", "West End", "gelato", "lee_white", "Lee + White"],
  ["One Korean Bistro", "Korean", "West End", "korean", "lee_white", "Lee + White"],
  ["Original Hot Dog Factory", "Hot dogs", "West End", "friedchicken", "lee_white", "Lee + White"],
  ["Sakura Sake Bar", "Cocktail bar", "West End", "cocktail", "lee_white", "Lee + White"],
  ["Sirocco Westside Deli", "Sandwich shop", "West End", "sandwich", "lee_white", "Lee + White"],
  ["Sweet Red Peach", "Bakery", "West End", "bakery", "lee_white", "Lee + White"],
  ["Vietvana Pho Noodle House", "Vietnamese", "West End", "asian", "lee_white", "Lee + White"],
  ["World of Chicken", "Korean fried chicken", "West End", "friedchicken", "lee_white", "Lee + White"],
  ["El Tesoro West End", "Mexican", "West End", "mexican", "lee_white", "Lee + White"],
  ["Cultured South Fermentation Co.", "Kombucha taproom", "West End", "vegan", "lee_white", "1038 White St SW"],
  ["Atlanta Food Truck Park", "Food truck park", "West End", "foodhall", "lee_white", "Lee + White"],
  ["Bogg's Social and Supply", "Bar · Music venue", "West End", "bar", "lee_white", "1310 White St SW"],
  ["Best End Brewing", "Brewery", "West End", "brewery", "lee_white", "1036 White St SW"],

  // Southwest Trail — Westview
  ["404 Grounds", "Coffee shop", "Westview", "coffee", "westview", "Ke'nekt Cooperative"],
  ["The Westwood", "Bar · Restaurant", "Westview", "bar", "westview", "Westview"],
  ["Firewall", "Wood-fired pizza", "Westview", "pizza", "westview", "Westview"],
  ["D Cafe and Catering", "Southern", "Westview", "bbq", "westview", "Westview"],
  ["BBQ 56", "Barbecue", "Westview", "bbq", "westview", "Westview"],
];

const generatedSpots: Spot[] = RAW_SPOTS.map(([name, category, area, photoKey, zoneKey, address]) => {
  const h = hash(name);
  const [baseLng, baseLat] = ZONES[zoneKey];
  const jitter = (seed: number) => ((hash(name + seed) % 1000) / 1000 - 0.5) * 0.003;
  const img = CATEGORY_PHOTO[photoKey];
  const rating = Math.round((4.1 + (h % 9) / 10) * 10) / 10;
  const badges: string[] = [];
  if (h % 5 === 0) badges.push("TRAIL PICK");
  else if (h % 5 === 1) badges.push("LOCAL FAVE");
  if (h % 7 === 0) badges.push("DEAL");

  return {
    id: slug(name),
    name,
    category,
    area,
    loved: 80 + (h % 19),
    rating,
    ratings: String(300 + (h % 2200)),
    openTill: DAYTIME_CATS.has(photoKey) ? ["5p", "6p", "7p"][h % 3] : ["10p", "11p", "12a", "1a"][h % 4],
    badges,
    img,
    imgs: [img],
    price: 60 + (h % 120),
    wasPrice: 60 + (h % 120) + 20 + (h % 60),
    lng: baseLng + jitter(1),
    lat: baseLat + jitter(2),
    address,
    walk: area === "O4W" || area === "Inman Park" ? "On the Eastside Trail" : `Near the ${area === "West End" || area === "Westview" ? "Westside" : "Southwest"} Trail`,
  };
});

export const spots: Spot[] = [...coreSpots, ...generatedSpots];

export const menuPicks = [
  { name: "Wood-fired pizza", img: "/photos/pizza.png" },
  { name: "New Realm Burger", img: "/photos/burger.png" },
  { name: "Street tacos", img: "/photos/tacos.png" },
];

export const friends = [
  { name: "Maya", place: "New Realm Brewing", status: "On the trail", battery: "76%", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=60" },
  { name: "Deon", place: "Eastside Trail", status: "At New Realm", battery: "89%", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=60" },
  { name: "Priya", place: "Krog Street Market", status: "Ponce City Market", battery: "64%", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=60" },
];

export const mapPins = [
  { x: 47, y: 16, r: 4.7 }, { x: 57, y: 18, r: 4.8 }, { x: 45, y: 21, r: 4.5 },
  { x: 34, y: 22, r: 4.6 }, { x: 63, y: 21, r: 4.2 }, { x: 55, y: 24, r: 4.9 },
  { x: 43, y: 25, r: 4.4 }, { x: 63, y: 25, r: 4.3 }, { x: 52, y: 27, r: 4.1 },
];

// approx Atlanta BeltLine loop + eastside spot pins (lon, lat)
export const beltlineLoop: [number, number][] = [
  [-84.408, 33.786], [-84.395, 33.799], [-84.376, 33.803], [-84.36, 33.796],
  [-84.35, 33.781], [-84.347, 33.762], [-84.354, 33.741], [-84.371, 33.727],
  [-84.394, 33.724], [-84.41, 33.734], [-84.418, 33.755], [-84.415, 33.773],
  [-84.408, 33.786],
];
// Turn-by-turn demo route: Eastside Trail, Ponce City Market → Krog Street Market
export const navRoute: [number, number][] = [
  [-84.366, 33.7726], [-84.3654, 33.771], [-84.3648, 33.7688],
  [-84.3644, 33.7662], [-84.364, 33.7635], [-84.3636, 33.7605],
  [-84.3632, 33.7575], [-84.3634, 33.7548], [-84.3636, 33.753],
];
export const navSteps: { at: number; icon: "up" | "right" | "left" | "flag"; dist: string; text: string }[] = [
  { at: 0.0, icon: "up", dist: "0.4 mi", text: "Head south on Eastside Trail" },
  { at: 0.28, icon: "up", dist: "0.3 mi", text: "Continue past Historic Fourth Ward Park" },
  { at: 0.55, icon: "up", dist: "0.3 mi", text: "Continue on Eastside Trail" },
  { at: 0.82, icon: "right", dist: "350 ft", text: "Bear right toward Krog Street Market" },
  { at: 0.97, icon: "flag", dist: "Arrive", text: "Krog Street Market" },
];

// meters between two lng/lat points (haversine)
export function distM(a: [number, number], b: [number, number]) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toR, dLng = (b[0] - a[0]) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Real (approximate) trail-segment centerlines, built from the actual street
// addresses/cross-streets in RAW_SPOTS above — NOT the same as `beltlineLoop`,
// which is a decorative full-corridor loop shape used for map art and puts
// Ponce City Market ~20min from "the trail" it's literally built on. These two
// short polylines trace the real Eastside Trail corridor (Piedmont Park down
// through PCM/Krog St) and the real Westside/Southwest Trail corridor
// (Westview through Lee+White to Pittsburgh Yards), for actual walk-distance
// filtering.
const EASTSIDE_TRAIL_PATH: [number, number][] = [
  [-84.372, 33.782], [-84.3715, 33.7815], [-84.371, 33.775], [-84.3669, 33.7719],
  [-84.371, 33.767], [-84.373, 33.766], [-84.3625, 33.7575], [-84.3636, 33.753],
  [-84.361, 33.746],
];
const SOUTHWEST_TRAIL_PATH: [number, number][] = [
  [-84.443, 33.735], [-84.415, 33.735], [-84.42, 33.726], [-84.416, 33.723],
  [-84.403, 33.719],
];
const WALK_M_PER_MIN = 80; // ~5 km/h average walking pace

export function nearestPointOnSegment(p: [number, number], a: [number, number], b: [number, number]): [number, number] {
  // flat-earth projection — fine at city scale; longitude scaled by cos(lat) to un-skew degrees
  const k = Math.cos((p[1] * Math.PI) / 180);
  const ax = a[0] * k, ay = a[1], bx = b[0] * k, by = b[1], px = p[0] * k, py = p[1];
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return [(ax + t * dx) / k, ay + t * dy];
}
function distToPolylineM(p: [number, number], path: [number, number][]): number {
  let min = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    min = Math.min(min, distM(p, nearestPointOnSegment(p, path[i], path[i + 1])));
  }
  return min;
}
export function walkMinutesFromTrail(lng: number, lat: number): number {
  const p: [number, number] = [lng, lat];
  return Math.min(distToPolylineM(p, EASTSIDE_TRAIL_PATH), distToPolylineM(p, SOUTHWEST_TRAIL_PATH)) / WALK_M_PER_MIN;
}

// openTill ("11p", "12a", "1a", "7p", ...) is the only real hours data we
// have — no opening time is stored. isOpenNow() assumes evening venues (close
// after 7p) open by 11a and daytime venues (close by 7p) open by 7a; measured
// relative to a 4am anchor so post-midnight closes ("12a"/"1a") don't need
// special-cased wraparound math.
function closeHour24(openTill: string): number {
  const m = /^(\d+)([ap])$/.exec(openTill);
  if (!m) return 23;
  const h = parseInt(m[1], 10) % 12;
  return m[2] === "p" ? h + 12 : h;
}
function hoursSince4am(h: number): number {
  return ((h - 4) % 24 + 24) % 24;
}
export function isOpenNow(spot: Spot): boolean {
  const close = closeHour24(spot.openTill);
  // daytime closes are 5p-7p (17-19); evening/late-night closes are 10p-1a
  // (22-23, or 0-1 post-midnight) — a small close value alone doesn't mean
  // daytime, since "12a"/"1a" parse to 0/1.
  const isDaytime = close >= 17 && close <= 19;
  const openAt = isDaytime ? 7 : 11; // daytime spots open ~7a, evening spots ~11a
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  return hoursSince4am(nowH) >= hoursSince4am(openAt) && hoursSince4am(nowH) < hoursSince4am(close);
}
export function closingTimeLabel(openTill: string): string {
  const m = /^(\d+)([ap])$/.exec(openTill);
  if (!m) return openTill;
  return `${m[1]}:00 ${m[2] === "a" ? "AM" : "PM"}`;
}

export const geoPins: { lng: number; lat: number; r: number }[] = [
  { lng: -84.3669, lat: 33.7719, r: 4.7 }, { lng: -84.3654, lat: 33.7669, r: 4.8 },
  { lng: -84.3725, lat: 33.7756, r: 4.5 }, { lng: -84.3629, lat: 33.7591, r: 4.6 },
  { lng: -84.3527, lat: 33.7644, r: 4.2 }, { lng: -84.3699, lat: 33.7631, r: 4.9 },
  { lng: -84.3805, lat: 33.7702, r: 4.4 }, { lng: -84.3547, lat: 33.7727, r: 4.3 },
  { lng: -84.3752, lat: 33.7554, r: 4.1 },
];

// Synthetic crowd-density sample points for the real MapLibre heatmap layer
// (Trail Conditions screen). Clustered hottest near Ponce City Market, warm
// near New Realm Brewing, light scatter along the rest of the trail.
export const crowdDensityPoints: { lng: number; lat: number; weight: number }[] = (() => {
  const jitter = (lng: number, lat: number, n: number, spread: number, weight: number) =>
    Array.from({ length: n }, () => ({
      lng: lng + (Math.random() - 0.5) * spread,
      lat: lat + (Math.random() - 0.5) * spread,
      weight,
    }));
  return [
    ...jitter(-84.366, 33.7726, 22, 0.004, 1),   // Ponce City Market — busiest
    ...jitter(-84.3669, 33.7719, 14, 0.0035, 0.7), // New Realm Brewing
    ...jitter(-84.3636, 33.753, 8, 0.003, 0.5),    // Krog Street Market
    ...beltlineLoop.flatMap((pt) => jitter(pt[0], pt[1], 3, 0.003, 0.3)),
  ];
})();
