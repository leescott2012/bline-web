// Ponce City Market 3D turn-by-turn scene.
// Geometry source: OpenStreetMap via Overpass, retrieved 2026-08-11.
// The pin is the trail-side point the user marked in Apple Maps Look Around.

export const PONCE_SCENE = {
  id: "ponce-corridor",
  name: "Ponce City Market",
  trailPin: [-84.364502, 33.773053] as [number, number],
  // Southbound follows the Apple Look Around reference: PCM sits on the
  // west/right edge of the forward trail view rather than floating in front.
  camera: { zoom: 17.6, pitch: 58, bearing: 170 },
  reference: {
    source: "User-guided Apple Maps Look Around review",
    notes:
      "PCM brick mass and steel canopy on one side; wide paved trail, dry meadow planting, mature trees, dark pedestrian lights, and active public realm.",
  },
} as const;

// Real mapped Eastside Trail geometry for the approach into the PCM
// trail-side pin. The route is kept deliberately short so the building mass
// remains in the immediate navigation frame; distance is computed at runtime.
export const PONCE_TRAIL_ROUTE: [number, number][] = [
  [-84.3648634, 33.7746998],
  [-84.3646959, 33.7737522],
  [-84.3646398, 33.7735292],
  [-84.3646342, 33.7735069],
  [-84.3645614, 33.7732178],
];

// Real Ponce City Market building footprint (OpenStreetMap way 184803195).
// OSM declares this building as industrial with 10 levels. The 3D height used
// by the map is an illustrative 30 m estimate (3 m per declared level) until
// a surveyed building-height source or PCM model is supplied.
export const PONCE_CITY_MARKET_FOOTPRINT: [number, number][] = [
  [-84.3649123, 33.7726316],
  [-84.3649197, 33.7725454],
  [-84.3648117, 33.772539],
  [-84.3648827, 33.7717139],
  [-84.3649253, 33.7717165],
  [-84.3649842, 33.77172],
  [-84.3649931, 33.7716159],
  [-84.3656531, 33.7716551],
  [-84.3655728, 33.7725966],
  [-84.3655663, 33.772665],
  [-84.3655607, 33.7727233],
  [-84.3655586, 33.7727547],
  [-84.3656031, 33.7727574],
  [-84.3660025, 33.7727811],
  [-84.3663619, 33.7728024],
  [-84.3664036, 33.7723174],
  [-84.3667896, 33.7723403],
  [-84.3667627, 33.7726544],
  [-84.3667149, 33.7732105],
  [-84.3662188, 33.7731815],
  [-84.3656309, 33.7731461],
  [-84.3656282, 33.7731785],
  [-84.365522, 33.7731722],
  [-84.3654447, 33.7731676],
  [-84.3654475, 33.7731344],
  [-84.3648721, 33.7731003],
  [-84.3649123, 33.7726316],
];

// Illustration-only planting beds, located from the user-guided visual review.
// They add the dry-meadow corridor character without claiming a survey-grade
// landscape boundary.
export const PONCE_PLANTING_BEDS: [number, number][][] = [
  [
    [-84.36528, 33.77308],
    [-84.36511, 33.77311],
    [-84.36492, 33.77454],
    [-84.36509, 33.77456],
    [-84.36528, 33.77308],
  ],
  [
    [-84.36439, 33.77323],
    [-84.36417, 33.77328],
    [-84.36443, 33.77477],
    [-84.36463, 33.77469],
    [-84.36439, 33.77323],
  ],
];

export const PONCE_TREE_POINTS: [number, number][] = [
  [-84.36497, 33.77337],
  [-84.3649, 33.77379],
  [-84.36477, 33.77419],
  [-84.36459, 33.77453],
  [-84.3652, 33.77346],
  [-84.36518, 33.77406],
  [-84.3651, 33.77449],
];
