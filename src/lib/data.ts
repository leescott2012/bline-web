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
export const spots: Spot[] = [
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
