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
    img: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=900&q=60",
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
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=60",
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
    address: "684 John Wesley Dobbs Ave",
    walk: "Right on the trail",
  },
];

export const menuPicks = [
  { name: "Wood-fired pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=60" },
  { name: "New Realm Burger", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=60" },
  { name: "Street tacos", img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=60" },
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
