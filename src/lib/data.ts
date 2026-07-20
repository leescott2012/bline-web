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
export const geoPins: { lng: number; lat: number; r: number }[] = [
  { lng: -84.3669, lat: 33.7719, r: 4.7 }, { lng: -84.3654, lat: 33.7669, r: 4.8 },
  { lng: -84.3725, lat: 33.7756, r: 4.5 }, { lng: -84.3629, lat: 33.7591, r: 4.6 },
  { lng: -84.3527, lat: 33.7644, r: 4.2 }, { lng: -84.3699, lat: 33.7631, r: 4.9 },
  { lng: -84.3805, lat: 33.7702, r: 4.4 }, { lng: -84.3547, lat: 33.7727, r: 4.3 },
  { lng: -84.3752, lat: 33.7554, r: 4.1 },
];
