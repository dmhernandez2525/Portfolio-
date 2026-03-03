import type { Building, Upgrade, Achievement } from "./types"

export const INITIAL_BUILDINGS: Building[] = [
  { id: "cursor", name: "Cursor", description: "Autoclicks once every 10 seconds", baseCost: 15, baseCps: 0.1, owned: 0, icon: "👆" },
  { id: "grandma", name: "Grandma", description: "A nice grandma to bake cookies", baseCost: 100, baseCps: 1, owned: 0, icon: "👵" },
  { id: "farm", name: "Farm", description: "Grows cookie plants", baseCost: 1100, baseCps: 8, owned: 0, icon: "🌾" },
  { id: "mine", name: "Mine", description: "Mines cookie dough", baseCost: 12000, baseCps: 47, owned: 0, icon: "⛏️" },
  { id: "factory", name: "Factory", description: "Mass produces cookies", baseCost: 130000, baseCps: 260, owned: 0, icon: "🏭" },
  { id: "bank", name: "Bank", description: "Generates cookies from interest", baseCost: 1400000, baseCps: 1400, owned: 0, icon: "🏦" },
  { id: "temple", name: "Temple", description: "Cookie worship generates cookies", baseCost: 20000000, baseCps: 7800, owned: 0, icon: "🛕" },
  { id: "wizard", name: "Wizard Tower", description: "Conjures cookies with magic", baseCost: 330000000, baseCps: 44000, owned: 0, icon: "🧙" },
  { id: "shipment", name: "Shipment", description: "Brings in cookies from cookie planet", baseCost: 5100000000, baseCps: 260000, owned: 0, icon: "🚀" },
  { id: "alchemy", name: "Alchemy Lab", description: "Turns gold into cookies", baseCost: 75000000000, baseCps: 1600000, owned: 0, icon: "⚗️" },
]

export const UPGRADES_DATA: Omit<Upgrade, "purchased">[] = [
  {
    id: "reinforced-finger",
    name: "Reinforced Index Finger",
    description: "Click power x2",
    cost: 100,
    icon: "👆",
    requirement: (s) => s.totalClicks >= 10
  },
  {
    id: "carpal-tunnel",
    name: "Carpal Tunnel Prevention",
    description: "Click power x2",
    cost: 500,
    icon: "🤚",
    requirement: (s) => s.totalClicks >= 50
  },
  {
    id: "ambidextrous",
    name: "Ambidextrous",
    description: "Click power x2",
    cost: 10000,
    icon: "✌️",
    requirement: (s) => s.totalClicks >= 200
  },
  // Grandmapocalypse Chain
  {
    id: "one-mind",
    name: "One Mind",
    description: "Grandmas are more efficient... but behave strangely.",
    cost: 12000,
    icon: "🧠",
    requirement: (s) => (s.buildings.find(b => b.id === "grandma")?.owned || 0) >= 10
  },
  {
    id: "communal-brainsweep",
    name: "Communal Brainsweep",
    description: "Grandmas work harder. The voices get louder.",
    cost: 120000,
    icon: "🧟",
    requirement: (s) => (s.buildings.find(b => b.id === "grandma")?.owned || 0) >= 25 && s.grandmapocalypseLevel >= 1
  },
  // Production upgrades
  {
    id: "steel-plated-rolling-pins",
    name: "Steel-plated Rolling Pins",
    description: "Grandmas are twice as efficient",
    cost: 5000,
    icon: "🔧",
    requirement: (s) => (s.buildings.find(b => b.id === "grandma")?.owned || 0) >= 5
  },
  {
    id: "cheap-hoes",
    name: "Cheap Hoes",
    description: "Farms are twice as efficient",
    cost: 11000,
    icon: "🪓",
    requirement: (s) => (s.buildings.find(b => b.id === "farm")?.owned || 0) >= 1
  },
  {
    id: "global-cps",
    name: "Kitten Helpers",
    description: "+10% CpS",
    cost: 50000,
    icon: "🐱",
    requirement: (s) => s.totalCookies >= 10000
  }
]

export const ACHIEVEMENTS_DATA: Omit<Achievement, "unlocked">[] = [
  { id: "first-cookie", name: "Wake and Bake", description: "Bake 1 cookie", icon: "🍪", check: (s) => s.totalCookies >= 1 },
  { id: "100-cookies", name: "Making Some Dough", description: "Bake 100 cookies", icon: "💰", check: (s) => s.totalCookies >= 100 },
  { id: "1000-cookies", name: "So Baked Right Now", description: "Bake 1,000 cookies", icon: "🔥", check: (s) => s.totalCookies >= 1000 },
  { id: "10000-cookies", name: "Fledgling Bakery", description: "Bake 10,000 cookies", icon: "🏠", check: (s) => s.totalCookies >= 10000 },
  { id: "grandma-1", name: "Just Wrong", description: "Sell a grandma", icon: "👵", check: (s) => (s.buildings.find(b => b.id === "grandma")?.owned || 0) >= 1 },
  { id: "click-50", name: "Clicktastic", description: "Click 50 times", icon: "👆", check: (s) => s.totalClicks >= 50 },
]

export const SAVE_KEY = "cookie-clicker-save-v2"
