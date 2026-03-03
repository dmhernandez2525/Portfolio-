# Holographic Globe - Software Design Document

## Overview

The Holographic Globe is a signature interactive component that visualizes Daniel's career journey across geographic locations. Built with CesiumJS/Resium, it provides a cinematic, space-themed experience with numerous interactive features and easter eggs.

**Location:** `src/components/3d/HolographicGlobe.tsx`

---

## Core Technologies

| Technology | Purpose |
|------------|---------|
| **CesiumJS** | Industry-grade 3D globe rendering engine |
| **Resium** | React declarative wrapper for Cesium components |
| **Framer Motion** | Animation utilities (via Tailwind's `animate-*` classes) |
| **Lucide React** | Icon library for control buttons |

---

## Architecture

### Component Structure

```
HolographicGlobe
├── Viewer (Cesium container)
│   ├── Entity[] - Location pins
│   ├── Entity - Journey path (polyline)
│   ├── Entity[] - Data pulses (ellipses)
│   ├── Entity[] - City lights
│   ├── Entity - ISS (orbiting)
│   ├── Entity[] - Satellite constellation
│   ├── Entity[] - Shooting stars
│   ├── Entity - Comet (occasional)
│   ├── Entity - UFO (rare easter egg)
│   └── Entity - Rocket launch
├── Overlay Effects
│   ├── Holographic scan line
│   ├── Gradient overlay
│   └── Vignette effect
├── Control Panel
│   ├── Play Journey button
│   ├── Reset View button
│   ├── Toggle Path button
│   ├── Toggle City Lights button
│   └── Time Speed button
├── Info Card (location details)
├── Legend (locations + space objects)
├── Journey Progress indicator
├── Toast notifications
└── Rocket altitude indicator
```

### State Management

```typescript
// Core UI State
mounted: boolean              // Component initialization
selectedLocation: LocationPin // Currently selected location
toastMessage: string | null   // Active notification
isPlayingJourney: boolean     // Auto-tour playback
journeyIndex: number          // Current tour stop
showJourneyPath: boolean      // Path visibility toggle
showCityLights: boolean       // City lights toggle
timeSpeed: number             // Time multiplier (1x, 10x, 50x)
scanLine: number              // Holographic effect position

// Dynamic Entities
issPosition: Cartesian3       // ISS orbital position
satellites: Array<{id, position}>  // Constellation positions
dataPulses: Array<{id, lat, lon, radius, opacity}>
shootingStars: Array<{id, start, end}>
comet: {start, end, visible} | null
ufo: {position, visible} | null
rocketLaunch: {position, altitude} | null

// Refs (non-reactive)
viewerRef: CesiumViewer       // Cesium viewer instance
containerRef: HTMLDivElement  // Container for scroll handling
initialFlyDone: boolean       // Prevents re-fly on re-render
zoomEasterEggShown: boolean   // One-time zoom easter egg
ufoShown: boolean             // One-time UFO appearance
satelliteData: Array          // Pre-generated satellite orbits
```

---

## Data Structures

### Location Pin Interface

```typescript
interface LocationPin {
  id: string          // Unique identifier
  name: string        // City, State format
  label: string       // Display category (Origin, Foundation, etc.)
  lat: number         // Latitude
  lon: number         // Longitude
  color: Color        // Cesium Color for pin
  title: string       // Card headline
  body: string        // Card description
  subtext?: string    // Optional italic note
  year?: string       // Timeline year
}
```

### Locations Data

| ID | Name | Label | Year | Color |
|----|------|-------|------|-------|
| albuquerque | Albuquerque, NM | Origin | 1990 | Cyan |
| charleston | Charleston, IL | Foundation | 2008 | Magenta |
| denver | Denver, CO | Growth | 2016 | Yellow |
| chicago | Chicago, IL | Enterprise | 2020 | Lime |
| grandrapids | Grand Rapids, MI | Defense | 2022 | Orange |
| secret | Secret Location | 🥚 | - | Purple |

---

## Features

### 1. Journey Playback

**Trigger:** "Play Journey" button

**Behavior:**
1. Starts at index 0
2. Flies camera to each location (2s duration)
3. Displays location info card
4. Waits 4 seconds
5. Advances to next location
6. Shows completion toast at end

**State Flow:**
```
Click Play → setIsPlayingJourney(true) → setJourneyIndex(0)
           → useEffect triggers camera.flyTo()
           → setTimeout advances journeyIndex
           → Repeats until complete
```

### 2. ISS Tracking

**Update Frequency:** 1 second

**Orbital Calculation:**
```typescript
const orbitProgress = (now % (92.68 * 60 * 1000)) / (92.68 * 60 * 1000)
const angle = orbitProgress * 360
const lat = 51.6 * Math.sin(angle * PI / 180)  // 51.6° inclination
const lon = (angle * 2 - 180) % 360 - 180
const altitude = 408000  // 408 km
```

**Easter Egg:** Click ISS for toast message about tracking systems.

### 3. Satellite Constellation

**Count:** 12 satellites

**Generation:**
```typescript
{
  id: string,
  inclination: 53 ± 5°,
  phase: distributed 0-360°,
  altitude: 550-600 km,
  speed: 0.8-1.2x
}
```

**Update Frequency:** 500ms

### 4. Data Pulses

**Visual:** Expanding cyan ellipses from location pins

**Behavior:**
- Spawns every 3 seconds from random location
- Radius expands from 50km to ~500km
- Opacity fades from 0.8 to 0
- Duration: ~800ms

### 5. Shooting Stars

**Trigger:** Only visible when camera height > 10,000 km

**Frequency:** Every 2.5 seconds

**Animation:**
- Random start position (lon: -180 to 180, lat: -60 to 60)
- Travels 30-60° with altitude drop
- Glowing white polyline
- Duration: 1.5 seconds

### 6. City Lights

**Data:** 15 major world cities

**Visual:** Small yellow points with orange glow

**Toggle:** City lights button (Zap icon)

### 7. Comet

**Trigger:** Camera height > 15,000 km

**Frequency:** Every 20 seconds

**Path:** Diagonal arc from high latitude to opposite hemisphere

**Visual:** Thick glowing blue-white polyline

### 8. UFO Easter Egg

**Trigger:** 2% chance every 10 seconds (once per session)

**Behavior:**
- Follows predefined wobbly path
- Green glowing point
- Clickable for toast message

### 9. Rocket Launch

**Trigger:** Double-click any location pin

**Animation:**
- Orange/red point rises from location
- Altitude displayed in real-time (km)
- Completes at 2,000 km with success toast

### 10. Time Speed Control

**Options:** 1x → 10x → 50x → 1x (cycle)

**Affects:**
- ISS orbital speed
- Satellite constellation movement
- Visual effect: faster space activity

### 11. Holographic Scan Line

**Visual:** Subtle cyan horizontal line sweeping down the globe

**Update:** Every 50ms, position cycles 0-100%

**Opacity:** 10% for subtlety

---

## Visual Effects

### Gradient Overlay
```css
background: linear-gradient(
  to top,
  rgba(0,0,0,0.7) 0%,
  transparent 50%,
  transparent 100%
)
```

### Vignette Effect
```css
background: radial-gradient(
  ellipse at center,
  transparent 50%,
  rgba(0,0,0,0.4) 100%
)
```

### Container Glow
```css
box-shadow: 0 0 60px rgba(0, 212, 255, 0.3)
border: 1px solid rgba(0, 212, 255, 0.3)
```

---

## Interactions

### Cursor States

| Context | Cursor |
|---------|--------|
| Globe container | `grab` |
| Dragging globe | `grabbing` (Cesium default) |
| Buttons | `pointer` |
| Info cards | `default` |

### Click Handlers

| Target | Single Click | Double Click |
|--------|--------------|--------------|
| Location pin | Select + fly to | Launch rocket |
| ISS | Show toast | - |
| Satellite | Show toast | - |
| UFO | Show toast | - |
| Ocean | Show toast | - |
| Rapid clicks (5x) | Spin easter egg | - |

### Scroll Behavior

- Scroll events are captured and stopped from propagating
- `overscrollBehavior: contain` prevents page scroll
- Zoom controls remain functional within globe

---

## Easter Eggs Summary

| Easter Egg | Trigger | Message |
|------------|---------|---------|
| Secret Pin | Find hidden Pacific Ocean pin | "🥚 Easter egg found!" |
| Zoom Out | Camera > 30,000 km | "Looking at the big picture?" |
| Ocean Click | Click water | "Nothing here yet... give me time" |
| Rapid Spin | 5 quick clicks | "Whoa, slow down!" |
| ISS Click | Click ISS | Orbital speed facts |
| Satellite Click | Click satellite | Starlink info |
| UFO Click | Click rare UFO | "Don't tell anyone..." |
| Rocket Launch | Double-click location | Launch animation + success toast |
| Journey Complete | Finish tour | "That's my story so far..." |

---

## Performance Considerations

### Optimizations

1. **Lazy mounting:** Component uses `mounted` state to defer Cesium initialization
2. **Ref-based flags:** Non-reactive values stored in refs to prevent re-renders
3. **Interval cleanup:** All intervals properly cleared on unmount
4. **Entity limits:**
   - Satellites: 12 max
   - Data pulses: Auto-cleanup after animation
   - Shooting stars: Auto-cleanup after 1.5s

### Memory Management

- Shooting stars auto-removed after animation
- Data pulses auto-removed when opacity reaches 0
- Comet auto-removed after 4 seconds
- UFO auto-removed after traversing path

---

## Accessibility

- All buttons have `cursor-pointer` for clickability indication
- Toast messages provide feedback for interactions
- Color-coded pins match legend for identification
- Time speed displayed numerically
- Altitude displayed during rocket launch

---

## Future Enhancement Ideas

1. **Real ISS API integration** - Fetch actual TLE data
2. **Weather layer** - Cloud coverage visualization
3. **Aurora borealis** - Animated effect near poles
4. **Day/night terminator line** - Visual boundary
5. **Time scrubber** - Manual time control slider
6. **Sound effects** - Ambient space audio, rocket sounds
7. **3D labels** - Floating text above locations
8. **Constellation overlay** - Star patterns when zoomed out
9. **Visitor locations** - Show where site visitors are from
10. **Achievement system** - Track found easter eggs

---

## File Dependencies

```
src/components/3d/HolographicGlobe.tsx
├── resium (Viewer, Entity, PointGraphics, PolylineGraphics, EllipseGraphics)
├── cesium (Cartesian3, Color, CallbackProperty, PolylineGlowMaterialProperty, ColorMaterialProperty)
├── react (useState, useEffect, useRef, useCallback)
├── @/lib/utils (cn)
└── lucide-react (Play, Pause, RotateCcw, Rocket, Zap, Clock)
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Basic globe with location pins |
| 2.0 | +ISS | Added ISS tracking, moon, sun, stars |
| 3.0 | +Magic | Journey playback, satellites, city lights, shooting stars, comets, UFO, rocket launch, data pulses, holographic effects, time speed control |
