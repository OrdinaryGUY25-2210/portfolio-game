// Muted, desaturated pastel palette — shared "source of truth" for both the
// Phaser world (hex numbers) and the DOM/CSS quest UI (see index.css, kept in sync manually).
// Chosen deliberately to avoid neon/bright game-asset defaults: everything is
// pulled a few notches toward grey so it reads as "worn paper + old cartridge" rather than "candy".

export const PALETTE = {
  // Sky gradients per time-of-day (see DayNightCycle)
  skyDawn: [0xe9c9b6, 0xcdd7c8],
  skyDay: [0xb9cdd6, 0xd9e4d1],
  skyDusk: [0xcf9f8f, 0x9aa4c2],
  skyNight: [0x2e2a45, 0x3c3a5c],

  ground: 0x9caf88,      // sage green
  groundDark: 0x7d9270,
  soil: 0x8a7860,        // muted umber
  water: 0x8fb3ac,       // dusty teal

  parchment: 0xe8dcc4,   // quest paper
  parchmentEdge: 0x8b7355,
  ink: 0x4a3f35,

  goldAccent: 0xc9a66b,  // muted gold, used for interactables/highlights
  rose: 0xc38d94,        // muted rose, second accent
  slate: 0x6c7a89,       // cool neutral

  zoneWebApps: 0xa7b6cf,       // dusty periwinkle
  zoneInteractive: 0xc7ae8b,   // sandstone
  zoneOtherDesigns: 0xb7c9a8,  // moss pastel
  zoneCertificates: 0xd4bfd6,  // muted lilac (floating islands)

  seasonSpring: 0xd9c7d1,
  seasonSummer: 0xcdd7af,
  seasonAutumn: 0xd3a97c,
  seasonWinter: 0xc9d3d9
};

export const CSS_VARS = {
  "--parchment": "#e8dcc4",
  "--parchment-edge": "#8b7355",
  "--ink": "#4a3f35",
  "--gold": "#c9a66b",
  "--rose": "#c38d94",
  "--night-veil": "rgba(46, 42, 69, 0.55)"
};
