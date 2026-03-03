import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect, useMemo, useCallback } from "react"
import { interpolate } from "flubber"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { useTheme } from "@/components/providers/ThemeProvider"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface StrokeDefinition {
  id: string
  sketchy: string
  clean: string
  drawOrder: number
  drawDuration: number
  category: "frame" | "bed" | "extruder" | "spool" | "control" | "object" | "detail"
  tooltip?: string
  erasable?: boolean // Can be erased during eraser phase
}

interface PathPoint {
  x: number
  y: number
}

interface DimensionLine {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  vertical?: boolean
  delay: number
}

interface Callout {
  id: string
  x: number
  y: number
  targetX: number
  targetY: number
  text: string
  delay: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  type: "pencil" | "eraser" | "glow" | "ink" | "shaving"
  color?: string
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  text: string
}


// ============================================================================
// ANIMATION PHASES & TIMING - EXTENDED
// ============================================================================

const PHASES = {
  BLANK: 0,           // 0-2s: Paper appears, pencil enters
  ROUGH_SKETCH: 1,    // 2-12s: Pencil draws rough sketch with wobble
  ANNOTATION: 2,      // 12-16s: Hand-written notes appear
  ERASING: 3,         // 16-20s: Eraser removes rough construction lines
  TOOLS: 4,           // 20-26s: T-square, compass, triangle arrive and work
  TRANSFORM: 5,       // 26-34s: Sketch morphs to blueprint
  DIMENSIONS: 6,      // 34-40s: Dimension lines and callouts
  COMPLETE: 7,        // 40-45s: Title block, stamp, signature
} as const

const PHASE_TIMINGS = {
  [PHASES.BLANK]: { start: 0, end: 2 },
  [PHASES.ROUGH_SKETCH]: { start: 2, end: 12 },
  [PHASES.ANNOTATION]: { start: 12, end: 16 },
  [PHASES.ERASING]: { start: 16, end: 20 },
  [PHASES.TOOLS]: { start: 20, end: 26 },
  [PHASES.TRANSFORM]: { start: 26, end: 34 },
  [PHASES.DIMENSIONS]: { start: 34, end: 40 },
  [PHASES.COMPLETE]: { start: 40, end: 45 },
}

const TOTAL_DURATION = 45

// ============================================================================
// STROKE DEFINITIONS - 3D PRINTER WITH CONSTRUCTION LINES
// ============================================================================

const strokes: StrokeDefinition[] = [
  // Construction lines (will be erased)
  {
    id: "constructionH1",
    sketchy: "M100 100 Q400 98 700 102",
    clean: "M100 100 L700 100",
    drawOrder: 0.5,
    drawDuration: 0.4,
    category: "detail",
    erasable: true,
  },
  {
    id: "constructionH2",
    sketchy: "M100 250 Q400 248 700 252",
    clean: "M100 250 L700 250",
    drawOrder: 0.6,
    drawDuration: 0.4,
    category: "detail",
    erasable: true,
  },
  {
    id: "constructionV1",
    sketchy: "M150 80 Q148 250 152 420",
    clean: "M150 80 L150 420",
    drawOrder: 0.7,
    drawDuration: 0.4,
    category: "detail",
    erasable: true,
  },
  {
    id: "constructionV2",
    sketchy: "M650 80 Q652 250 648 420",
    clean: "M650 80 L650 420",
    drawOrder: 0.8,
    drawDuration: 0.4,
    category: "detail",
    erasable: true,
  },
  // Main strokes
  {
    id: "frameLeft",
    sketchy: "M122 398 Q120 300 123 202 Q121 150 124 98 L126 96 Q128 94 132 95 Q134 150 131 200 Q133 300 130 398 Q128 402 124 400 Z",
    clean: "M120 400 L120 95 L135 95 L135 400 Z",
    drawOrder: 1,
    drawDuration: 0.8,
    category: "frame",
    tooltip: "2020 Aluminum Extrusion\n20x20mm V-Slot Profile",
  },
  {
    id: "frameRight",
    sketchy: "M668 398 Q670 300 667 202 Q669 150 666 98 L672 96 Q676 94 680 95 Q678 150 681 200 Q679 300 682 398 Q680 402 676 400 Z",
    clean: "M665 400 L665 95 L680 95 L680 400 Z",
    drawOrder: 2,
    drawDuration: 0.8,
    category: "frame",
    tooltip: "2020 Aluminum Extrusion\n20x20mm V-Slot Profile",
  },
  {
    id: "gantryBar",
    sketchy: "M118 98 Q200 96 300 99 Q400 97 500 98 Q600 96 680 99 L682 108 Q600 112 500 109 Q400 111 300 110 Q200 112 120 109 Z",
    clean: "M115 95 L685 95 L685 110 L115 110 Z",
    drawOrder: 3,
    drawDuration: 1.0,
    category: "frame",
    tooltip: "X-Axis Gantry Rail\nLinear Motion System",
  },
  {
    id: "printBed",
    sketchy: "M148 398 Q250 396 400 399 Q550 397 652 400 L656 418 Q550 422 400 419 Q250 421 148 418 Z",
    clean: "M145 400 L655 400 L655 420 L145 420 Z",
    drawOrder: 4,
    drawDuration: 0.9,
    category: "bed",
    tooltip: "Print Bed Assembly\n300x300mm Build Area",
  },
  {
    id: "bedSurface",
    sketchy: "M168 378 Q270 376 400 379 Q530 377 632 380 L634 396 Q530 400 400 397 Q270 399 166 396 Z",
    clean: "M165 380 L635 380 L635 398 L165 398 Z",
    drawOrder: 5,
    drawDuration: 0.7,
    category: "bed",
    tooltip: "Heated Bed Surface\nMax Temp: 110°C",
  },
  {
    id: "extruderCarriage",
    sketchy: "M358 108 Q380 106 400 109 Q420 107 442 110 L444 148 Q420 152 400 149 Q380 151 358 148 Z",
    clean: "M355 108 L445 108 L445 150 L355 150 Z",
    drawOrder: 6,
    drawDuration: 0.6,
    category: "extruder",
    tooltip: "Extruder Carriage\nDirect Drive System",
  },
  {
    id: "hotend",
    sketchy: "M378 148 Q390 146 400 149 Q410 147 422 150 L418 188 Q408 192 400 189 Q392 191 382 188 Z",
    clean: "M375 150 L425 150 L420 190 L380 190 Z",
    drawOrder: 7,
    drawDuration: 0.5,
    category: "extruder",
    tooltip: "All-Metal Hotend\nMax Temp: 300°C",
  },
  {
    id: "nozzle",
    sketchy: "M392 188 Q398 186 400 189 Q402 187 408 190 L406 212 Q402 216 400 213 Q398 215 394 212 Z",
    clean: "M390 190 L410 190 L405 215 L395 215 Z",
    drawOrder: 8,
    drawDuration: 0.4,
    category: "extruder",
    tooltip: "Brass Nozzle\n0.4mm Diameter",
  },
  {
    id: "spoolHolder",
    sketchy: "M688 148 Q692 146 698 149 L702 168 Q698 172 692 169 Q688 171 686 168 Z",
    clean: "M685 145 L705 145 L705 170 L685 170 Z",
    drawOrder: 9,
    drawDuration: 0.4,
    category: "spool",
    tooltip: "Spool Holder Bracket\n608ZZ Bearing Mount",
  },
  {
    id: "spool",
    sketchy: "M678 128 Q700 110 722 128 Q740 150 722 172 Q700 190 678 172 Q660 150 678 128",
    clean: "M675 125 Q700 105 725 125 Q745 150 725 175 Q700 195 675 175 Q655 150 675 125",
    drawOrder: 10,
    drawDuration: 0.6,
    category: "spool",
    tooltip: "1kg Filament Spool\nPLA/PETG/ABS Compatible",
  },
  {
    id: "filament",
    sketchy: "M678 152 Q620 148 560 155 Q500 145 445 152",
    clean: "M675 150 L445 150",
    drawOrder: 11,
    drawDuration: 0.5,
    category: "spool",
    tooltip: "PTFE Filament Guide\n1.75mm Diameter",
  },
  {
    id: "controlPanel",
    sketchy: "M148 298 Q175 296 208 299 L212 358 Q180 362 152 359 Q148 340 150 298 Z",
    clean: "M145 295 L215 295 L215 360 L145 360 Z",
    drawOrder: 12,
    drawDuration: 0.5,
    category: "control",
    tooltip: "Control Box\n32-bit Mainboard",
  },
  {
    id: "screen",
    sketchy: "M158 308 Q178 306 198 309 L196 338 Q176 342 158 339 Z",
    clean: "M155 305 L205 305 L205 345 L155 345 Z",
    drawOrder: 13,
    drawDuration: 0.4,
    category: "control",
    tooltip: "LCD Touchscreen\n4.3\" Color Display",
  },
  {
    id: "printedObject",
    sketchy: "M382 338 Q395 336 408 339 L412 378 Q398 382 385 379 Q380 360 382 338 Z",
    clean: "M380 335 L415 335 L415 378 L380 378 Z",
    drawOrder: 14,
    drawDuration: 0.5,
    category: "object",
    tooltip: "Sample Print\n35x35x43mm Test Cube",
  },
  {
    id: "leadScrewLeft",
    sketchy: "M138 398 Q140 300 137 200 Q139 150 136 98",
    clean: "M137 400 L137 95",
    drawOrder: 15,
    drawDuration: 0.3,
    category: "detail",
    tooltip: "Z-Axis Lead Screw\nT8x2 Pitch",
  },
  {
    id: "leadScrewRight",
    sketchy: "M662 398 Q664 300 661 200 Q663 150 660 98",
    clean: "M663 400 L663 95",
    drawOrder: 16,
    drawDuration: 0.3,
    category: "detail",
    tooltip: "Z-Axis Lead Screw\nT8x2 Pitch",
  },
  {
    id: "yAxisRail",
    sketchy: "M148 390 Q300 388 400 391 Q500 389 652 392",
    clean: "M145 390 L655 390",
    drawOrder: 17,
    drawDuration: 0.4,
    category: "detail",
    tooltip: "Y-Axis Linear Rail\nMGN12H Carriage",
  },
  {
    id: "xBelt",
    sketchy: "M358 120 Q300 118 200 121 Q150 119 130 122",
    clean: "M355 120 L130 120",
    drawOrder: 18,
    drawDuration: 0.3,
    category: "detail",
    tooltip: "GT2 Timing Belt\n6mm Width",
  },
  {
    id: "motorLeft",
    sketchy: "M108 380 Q112 378 130 381 L132 398 Q116 402 110 399 Z",
    clean: "M105 380 L135 380 L135 400 L105 400 Z",
    drawOrder: 19,
    drawDuration: 0.3,
    category: "detail",
    tooltip: "NEMA 17 Stepper\n1.8° Step Angle",
  },
  {
    id: "motorRight",
    sketchy: "M668 380 Q672 378 690 381 L692 398 Q676 402 670 399 Z",
    clean: "M665 380 L695 380 L695 400 L665 400 Z",
    drawOrder: 20,
    drawDuration: 0.3,
    category: "detail",
    tooltip: "NEMA 17 Stepper\n1.8° Step Angle",
  },
  // Additional details for complexity
  {
    id: "coolingFan",
    sketchy: "M440 165 Q455 163 458 178 Q456 192 442 194 Q428 192 426 178 Q428 164 440 165",
    clean: "M438 163 Q460 163 460 180 Q460 197 438 197 Q416 197 416 180 Q416 163 438 163",
    drawOrder: 21,
    drawDuration: 0.4,
    category: "extruder",
    tooltip: "Part Cooling Fan\n5015 Blower",
  },
  {
    id: "fanDuct",
    sketchy: "M455 180 Q470 185 475 200 Q478 210 470 215",
    clean: "M458 180 L475 190 L478 210 L465 218",
    drawOrder: 22,
    drawDuration: 0.3,
    category: "extruder",
    tooltip: "Cooling Duct\nPETG Print",
  },
  {
    id: "bedLevelKnob1",
    sketchy: "M160 425 Q170 423 172 433 Q170 443 160 441 Q150 439 152 429 Q154 423 160 425",
    clean: "M160 422 Q175 422 175 435 Q175 448 160 448 Q145 448 145 435 Q145 422 160 422",
    drawOrder: 23,
    drawDuration: 0.25,
    category: "bed",
    tooltip: "Bed Level Knob\nM4 Thread",
  },
  {
    id: "bedLevelKnob2",
    sketchy: "M640 425 Q650 423 652 433 Q650 443 640 441 Q630 439 632 429 Q634 423 640 425",
    clean: "M640 422 Q655 422 655 435 Q655 448 640 448 Q625 448 625 435 Q625 422 640 422",
    drawOrder: 24,
    drawDuration: 0.25,
    category: "bed",
    tooltip: "Bed Level Knob\nM4 Thread",
  },
]

// ============================================================================
// PENCIL PATH WAYPOINTS - Key points the pencil visits while drawing
// ============================================================================

const pencilWaypoints: PathPoint[] = [
  // Start offscreen
  { x: -50, y: 300 },
  // Draw construction lines first
  { x: 100, y: 100 }, { x: 700, y: 100 },
  { x: 100, y: 250 }, { x: 700, y: 250 },
  { x: 150, y: 80 }, { x: 150, y: 420 },
  { x: 650, y: 80 }, { x: 650, y: 420 },
  // Frame left
  { x: 125, y: 400 }, { x: 125, y: 95 },
  // Frame right
  { x: 670, y: 400 }, { x: 670, y: 95 },
  // Gantry
  { x: 120, y: 100 }, { x: 680, y: 100 },
  // Bed
  { x: 150, y: 400 }, { x: 650, y: 400 }, { x: 650, y: 420 }, { x: 150, y: 420 },
  // Extruder
  { x: 360, y: 110 }, { x: 440, y: 110 }, { x: 440, y: 150 }, { x: 360, y: 150 },
  // Hotend
  { x: 380, y: 150 }, { x: 420, y: 150 }, { x: 410, y: 190 }, { x: 390, y: 190 },
  // Nozzle
  { x: 395, y: 190 }, { x: 405, y: 190 }, { x: 400, y: 215 },
  // Spool
  { x: 700, y: 150 }, { x: 720, y: 130 }, { x: 700, y: 110 }, { x: 680, y: 130 }, { x: 700, y: 150 },
  // Filament
  { x: 675, y: 150 }, { x: 445, y: 150 },
  // Control panel
  { x: 150, y: 300 }, { x: 210, y: 300 }, { x: 210, y: 355 }, { x: 150, y: 355 },
  // Screen
  { x: 160, y: 310 }, { x: 200, y: 310 }, { x: 200, y: 340 }, { x: 160, y: 340 },
  // Printed object
  { x: 385, y: 340 }, { x: 410, y: 340 }, { x: 410, y: 375 }, { x: 385, y: 375 },
  // Exit
  { x: 750, y: 300 },
]

// ============================================================================
// ERASER WAYPOINTS - Points eraser visits (for construction lines)
// ============================================================================

const eraserWaypoints: PathPoint[] = [
  { x: -80, y: 100 },
  { x: 100, y: 100 }, { x: 700, y: 100 }, // Erase horizontal 1
  { x: 100, y: 250 }, { x: 700, y: 250 }, // Erase horizontal 2
  { x: 150, y: 80 }, { x: 150, y: 420 },  // Erase vertical 1
  { x: 650, y: 80 }, { x: 650, y: 420 },  // Erase vertical 2
  { x: 800, y: 250 },
]

// ============================================================================
// DIMENSION LINES & CALLOUTS
// ============================================================================

const dimensionLines: DimensionLine[] = [
  { id: "width", x1: 120, y1: 470, x2: 680, y2: 470, label: "560mm", delay: 0 },
  { id: "height", x1: 60, y1: 95, x2: 60, y2: 400, label: "305mm", vertical: true, delay: 0.3 },
  { id: "bedWidth", x1: 145, y1: 440, x2: 655, y2: 440, label: "510mm", delay: 0.6 },
  { id: "extruderWidth", x1: 355, y1: 80, x2: 445, y2: 80, label: "90mm", delay: 0.9 },
  { id: "nozzleHeight", x1: 430, y1: 150, x2: 430, y2: 215, label: "65mm", vertical: true, delay: 1.2 },
]

const callouts: Callout[] = [
  { id: "extruder", x: 480, y: 120, targetX: 445, targetY: 130, text: "EXTRUDER ASSEMBLY", delay: 0.2 },
  { id: "hotend", x: 480, y: 170, targetX: 425, targetY: 170, text: "HOTEND / NOZZLE", delay: 0.4 },
  { id: "bed", x: 500, y: 390, targetX: 450, targetY: 390, text: "HEATED BED", delay: 0.6 },
  { id: "spool", x: 740, y: 120, targetX: 725, targetY: 150, text: "FILAMENT SPOOL", delay: 0.8 },
  { id: "display", x: 100, y: 270, targetX: 155, targetY: 305, text: "LCD DISPLAY", delay: 1.0 },
  { id: "fan", x: 490, y: 200, targetX: 465, targetY: 200, text: "COOLING SYSTEM", delay: 1.2 },
]

// ============================================================================
// SKETCH ANNOTATIONS
// ============================================================================

const sketchAnnotations = [
  { x: 450, y: 130, text: "extruder?", rotation: -5, delay: 0.5 },
  { x: 220, y: 340, text: "LCD here", rotation: 3, delay: 1.0 },
  { x: 500, y: 360, text: "print area", rotation: -2, delay: 1.5 },
  { x: 720, y: 140, text: "filament", rotation: 8, delay: 2.0 },
  { x: 160, y: 200, text: "frame", rotation: -4, delay: 2.5 },
  { x: 580, y: 200, text: "frame", rotation: 3, delay: 2.8 },
  { x: 400, y: 450, text: "need to check measurements!", rotation: -1, delay: 3.2 },
  { x: 300, y: 130, text: "belt path →", rotation: 2, delay: 3.5 },
]

// ============================================================================
// COFFEE RING DATA
// ============================================================================

const coffeeRing = {
  cx: 720,
  cy: 480,
  r: 30,
  opacity: 0.12,
}

// ============================================================================
// HELPER FUNCTION - Get point along waypoints
// ============================================================================

const getPointAlongWaypoints = (waypoints: PathPoint[], progress: number): PathPoint => {
  if (waypoints.length < 2) return waypoints[0] || { x: 0, y: 0 }

  const totalSegments = waypoints.length - 1
  const segment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1)
  const segmentProgress = (progress * totalSegments) - segment

  const p1 = waypoints[segment]
  const p2 = waypoints[segment + 1]

  return {
    x: p1.x + (p2.x - p1.x) * segmentProgress,
    y: p1.y + (p2.y - p1.y) * segmentProgress,
  }
}

// ============================================================================
// HELPER FUNCTION - Extract points from SVG path string
// ============================================================================

const extractPathPoints = (pathStr: string): PathPoint[] => {
  const points: PathPoint[] = []
  // Match M, L, Q, C commands with their coordinates
  const regex = /([MLQCZ])\s*(-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)?/gi
  let match

  while ((match = regex.exec(pathStr)) !== null) {
    const cmd = match[1].toUpperCase()
    const x = parseFloat(match[2])
    const y = parseFloat(match[3] || '0')

    if (!isNaN(x) && !isNaN(y) && cmd !== 'Z') {
      points.push({ x, y })
    }
  }

  return points
}

const getPointAlongPath = (pathStr: string, progress: number): PathPoint => {
  const points = extractPathPoints(pathStr)
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1) return points[0]

  const totalSegments = points.length - 1
  const segment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1)
  const segmentProgress = (progress * totalSegments) - segment

  const p1 = points[segment]
  const p2 = points[Math.min(segment + 1, points.length - 1)]

  return {
    x: p1.x + (p2.x - p1.x) * segmentProgress,
    y: p1.y + (p2.y - p1.y) * segmentProgress,
  }
}

// ============================================================================
// TOOL COMPONENTS
// ============================================================================

interface PencilProps {
  x: number
  y: number
  rotation: number
  pressure: number
  visible: boolean
  isDrawing: boolean
}

function Pencil({ x, y, rotation, pressure, visible, isDrawing }: PencilProps) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.5,
        x,
        y,
        rotate: rotation,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Pencil body */}
      <motion.path
        d="M-5 -60 L5 -60 L8 0 L-8 0 Z"
        fill="#F4D03F"
        stroke="#8B4513"
        strokeWidth={1}
        animate={{ scaleY: 1 - pressure * 0.03 }}
      />
      {/* Wood tip */}
      <path d="M-8 0 L8 0 L2 15 L-2 15 Z" fill="#DEB887" stroke="#8B4513" strokeWidth={0.5} />
      {/* Graphite tip */}
      <motion.path
        d="M-2 15 L2 15 L0 28 Z"
        fill="#333"
        animate={{ scale: isDrawing ? [1, 0.92, 1] : 1 }}
        transition={{ duration: 0.08, repeat: isDrawing ? Infinity : 0 }}
      />
      {/* Eraser */}
      <rect x="-6" y="-68" width="12" height="8" fill="#E57373" rx="1" />
      {/* Metal band */}
      <rect x="-7" y="-60" width="14" height="5" fill="#B0BEC5" />
      {/* Drawing tip glow when active */}
      {isDrawing && (
        <>
          <motion.circle
            cx="0"
            cy="28"
            r="4"
            fill="#333"
            opacity={0.4}
            animate={{ scale: [1, 1.8, 0], opacity: [0.4, 0.1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
          {/* Graphite dust */}
          <motion.circle
            cx="2"
            cy="30"
            r="1"
            fill="#666"
            animate={{ y: [30, 45], opacity: [0.6, 0], x: [2, 8] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <motion.circle
            cx="-2"
            cy="30"
            r="1.5"
            fill="#555"
            animate={{ y: [30, 42], opacity: [0.5, 0], x: [-2, -6] }}
            transition={{ duration: 0.35, repeat: Infinity, delay: 0.1 }}
          />
        </>
      )}
    </motion.g>
  )
}

interface EraserProps {
  x: number
  y: number
  rotation: number
  visible: boolean
  isErasing: boolean
}

function EraserShaving({ index }: { index: number }) {
  // Pre-calculate random values once on mount
  // Pre-calculate random values once on mount using useState lazy initializer
  const [randoms] = useState(() => ({
    rotateInit: Math.random() * 360,
    yTarget: 35 + Math.random() * 25,
    xTarget: (Math.random() - 0.5) * 30,
    rotateTarget: Math.random() * 720,
    duration: 0.6 + Math.random() * 0.3
  }))

  return (
    <motion.ellipse
      cx={(index - 4) * 6}
      cy="18"
      rx="3"
      ry="1.5"
      fill="#FFCDD2"
      initial={{ opacity: 0.9, y: 18, rotate: randoms.rotateInit }}
      animate={{
        opacity: 0,
        y: randoms.yTarget,
        x: randoms.xTarget,
        rotate: randoms.rotateTarget,
      }}
      transition={{ duration: randoms.duration, repeat: Infinity, delay: index * 0.08 }}
    />
  )
}

function Eraser({ x, y, rotation, visible, isErasing }: EraserProps) {
  return (
    <motion.g
      initial={{ opacity: 0, x: -100 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? x : -100,
        y,
        rotate: rotation,
      }}
      transition={{ type: "spring", damping: 15 }}
    >
      {/* Eraser body - realistic pink eraser */}
      <rect x="-25" y="-12" width="50" height="24" rx="4" fill="#E57373" stroke="#C62828" strokeWidth={1.5} />
      {/* Eraser wear marks */}
      <path d="M-20 8 Q-15 10 -10 8" stroke="#FFCDD2" strokeWidth={1} fill="none" opacity={0.6} />
      <path d="M5 -6 Q10 -8 15 -6" stroke="#FFCDD2" strokeWidth={1} fill="none" opacity={0.6} />
      {/* Brand text */}
      <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" opacity={0.9}>
        ERASE
      </text>
      {/* Eraser shavings when erasing */}
      {isErasing && (

        <>
          {[...Array(8)].map((_, i) => (
            <EraserShaving key={i} index={i} />
          ))}
          {/* Eraser dust cloud */}
          <motion.ellipse
            cx="0"
            cy="20"
            rx="30"
            ry="10"
            fill="#FFCDD2"
            opacity={0.3}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}

    </motion.g>
  )
}

interface TSquareProps {
  visible: boolean
  position: { x: number; y: number }
  rotation: number
}

function TSquare({ visible, position, rotation }: TSquareProps) {
  return (
    <motion.g
      initial={{ opacity: 0, x: -200 }}
      animate={{
        opacity: visible ? 0.9 : 0,
        x: visible ? position.x : -200,
        y: position.y,
        rotate: rotation,
      }}
      transition={{ type: "spring", damping: 20, duration: 1 }}
    >
      {/* Head of T-square */}
      <rect x="-100" y="-18" width="65" height="36" fill="#8B4513" stroke="#5D3A1A" strokeWidth={2} rx="3" />
      {/* Wood grain on head */}
      <path d="M-95 -10 Q-70 -8 -40 -10" stroke="#5D3A1A" strokeWidth={0.5} fill="none" opacity={0.5} />
      <path d="M-95 0 Q-70 2 -40 0" stroke="#5D3A1A" strokeWidth={0.5} fill="none" opacity={0.5} />
      {/* Blade */}
      <rect x="-35" y="-6" width="520" height="12" fill="#DEB887" stroke="#8B4513" strokeWidth={1} />
      {/* Measurement marks */}
      {[...Array(26)].map((_, i) => (
        <g key={i}>
          <line
            x1={-25 + i * 20}
            y1="-6"
            x2={-25 + i * 20}
            y2={i % 5 === 0 ? "0" : "-3"}
            stroke="#333"
            strokeWidth={i % 5 === 0 ? 1 : 0.5}
          />
          {i % 5 === 0 && i > 0 && (
            <text x={-25 + i * 20} y="8" fontSize="6" fill="#333" textAnchor="middle">
              {i * 2}
            </text>
          )}
        </g>
      ))}
    </motion.g>
  )
}

interface TriangleProps {
  visible: boolean
  position: { x: number; y: number }
  rotation: number
}

function Triangle({ visible, position, rotation }: TriangleProps) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0, rotate: 45 }}
      animate={{
        opacity: visible ? 0.85 : 0,
        scale: visible ? 1 : 0,
        x: position.x,
        y: position.y,
        rotate: rotation,
      }}
      transition={{ type: "spring", damping: 15, duration: 0.8 }}
    >
      {/* Triangle body (30-60-90) */}
      <path d="M0 0 L90 0 L90 156 Z" fill="rgba(144, 238, 144, 0.35)" stroke="#228B22" strokeWidth={2.5} />
      {/* Inner cutout */}
      <path d="M18 12 L72 12 L72 115 Z" fill="rgba(255,255,255,0.1)" stroke="#228B22" strokeWidth={1} opacity={0.6} />
      {/* Angle marks */}
      <text x="28" y="24" fill="#228B22" fontSize="10" fontWeight="bold">90°</text>
      <text x="68" y="80" fill="#228B22" fontSize="10" fontWeight="bold">60°</text>
      <text x="6" y="10" fill="#228B22" fontSize="10" fontWeight="bold">30°</text>
      {/* Measurement tick marks */}
      {[...Array(9)].map((_, i) => (
        <line key={i} x1="90" y1={i * 17} x2="85" y2={i * 17} stroke="#228B22" strokeWidth={1} />
      ))}
    </motion.g>
  )
}

interface CompassProps {
  visible: boolean
  position: { x: number; y: number }
  rotation: number
  spread: number
  isDrawing: boolean
  arcProgress: number
}

function Compass({ visible, position, rotation, spread, isDrawing, arcProgress }: CompassProps) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0,
        x: position.x,
        y: position.y,
        rotate: rotation,
      }}
      transition={{ type: "spring", damping: 15, duration: 0.8 }}
    >
      {/* Compass arc being drawn */}
      {isDrawing && (
        <motion.circle
          cx="0"
          cy="0"
          r="55"
          fill="none"
          stroke="#666"
          strokeWidth={2}
          strokeDasharray="345"
          strokeDashoffset={345 * (1 - arcProgress)}
          opacity={0.7}
        />
      )}
      {/* Pivot point */}
      <circle cx="0" cy="0" r="10" fill="#B0BEC5" stroke="#607D8B" strokeWidth={2} />
      <circle cx="0" cy="0" r="3" fill="#333" />
      {/* Left leg (needle) */}
      <motion.g animate={{ rotate: -spread }}>
        <line x1="0" y1="0" x2="0" y2="75" stroke="#607D8B" strokeWidth={4} />
        <line x1="-2" y1="70" x2="2" y2="70" stroke="#607D8B" strokeWidth={2} />
        <circle cx="0" cy="75" r="3" fill="#333" />
      </motion.g>
      {/* Right leg (pencil) */}
      <motion.g animate={{ rotate: spread }}>
        <line x1="0" y1="0" x2="0" y2="75" stroke="#607D8B" strokeWidth={4} />
        <rect x="-4" y="62" width="8" height="18" fill="#F4D03F" rx="1" />
        <path d="M-4 80 L4 80 L0 90 Z" fill="#333" />
      </motion.g>
      {/* Adjustment wheel */}
      <circle cx="0" cy="-8" r="5" fill="#90A4AE" stroke="#607D8B" strokeWidth={1} />
      <line x1="-3" y1="-8" x2="3" y2="-8" stroke="#607D8B" strokeWidth={1} />
    </motion.g>
  )
}

interface TechnicalPenProps {
  visible: boolean
  position: { x: number; y: number }
  rotation: number
  isDrawing: boolean
}

function TechnicalPen({ visible, position, rotation, isDrawing }: TechnicalPenProps) {
  return (
    <motion.g
      initial={{ opacity: 0, y: -100 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: position.x,
        y: visible ? position.y : -100,
        rotate: rotation,
      }}
      transition={{ type: "spring", damping: 20 }}
    >
      {/* Pen cap clip */}
      <rect x="5" y="-55" width="2" height="20" fill="#90CAF9" />
      {/* Pen body */}
      <rect x="-5" y="-55" width="10" height="50" fill="#1565C0" rx="2" />
      {/* Grip section */}
      <rect x="-6" y="-5" width="12" height="25" fill="#333" rx="1" />
      {/* Grip rings */}
      {[...Array(5)].map((_, i) => (
        <line key={i} x1="-6" y1={i * 5 - 3} x2="6" y2={i * 5 - 3} stroke="#444" strokeWidth={0.5} />
      ))}
      {/* Needle tip */}
      <path d="M-3 20 L3 20 L0 42 Z" fill="#90CAF9" stroke="#1565C0" strokeWidth={0.5} />
      {/* Ink flow indicator */}
      {isDrawing && (
        <>
          <motion.circle
            cx="0"
            cy="42"
            r="3"
            fill="#00D4FF"
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
          {/* Ink drops */}
          <motion.circle
            cx="0"
            cy="45"
            r="1.5"
            fill="#00D4FF"
            animate={{ y: [45, 60], opacity: [0.8, 0] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </>
      )}
    </motion.g>
  )
}

// ============================================================================
// EFFECT COMPONENTS
// ============================================================================

function ScanLine({ active }: { active: boolean }) {
  const [position, setPosition] = useState(0)

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setPosition((p) => (p + 0.8) % 100)
    }, 30)
    return () => clearInterval(interval)
  }, [active])

  if (!active) return null

  return (
    <motion.div
      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none"
      style={{ top: `${position}%` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.35 }}
    />
  )
}

function ParticleSystem({ particles }: { particles: Particle[] }) {
  return (
    <g className="pointer-events-none">
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={p.color || (p.type === "pencil" ? "#333" : p.type === "eraser" ? "#FFCDD2" : p.type === "shaving" ? "#FFCDD2" : p.type === "ink" ? "#00D4FF" : "#00D4FF")}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0, x: p.x + p.vx * 30, y: p.y + p.vy * 30 }}
          transition={{ duration: p.life }}
        />
      ))}
    </g>
  )
}

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

function Tooltip({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip.visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-50 bg-gray-900/95 backdrop-blur-sm text-cyan-400 px-3 py-2 rounded-lg text-xs font-mono shadow-lg border border-cyan-500/30 whitespace-pre-line pointer-events-none"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: "translate(-50%, -100%) translateY(-10px)",
      }}
    >
      {tooltip.text}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900/95" />
    </motion.div>
  )
}

// ============================================================================
// CONTROL PANEL COMPONENT
// ============================================================================

interface ControlPanelProps {
  isPlaying: boolean
  onPlayPause: () => void
  onReplay: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  progress: number
  phaseName: string
}

function ControlPanel({ isPlaying, onPlayPause, onReplay, soundEnabled, onToggleSound, progress, phaseName }: ControlPanelProps) {
  return (
    <motion.div
      className="absolute bottom-4 right-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer"
        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onReplay(); }}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer"
        title="Replay (R)"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSound(); }}
        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white cursor-pointer"
        title="Toggle Sound"
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
      <div className="flex flex-col items-start ml-2">
        <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan-400 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[9px] text-white/50 mt-0.5">{phaseName}</span>
      </div>
    </motion.div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SketchToBlueprint() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, margin: "-50px" })
  const { theme } = useTheme()

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false

  // Theme-aware colors
  const isDarkMode = theme === "dark"
  const sketchStrokeColor = isDarkMode ? "#888" : "#444" // Lighter in dark mode for visibility
  const paperColor = isDarkMode ? "#1a1a1a" : "#F5F5DC"
  const blueprintBgColor = "#001830" // Always dark for blueprint phase

  // Animation state
  const [phase, setPhase] = useState<number>(PHASES.BLANK)
  const [currentTime, setCurrentTime] = useState(0)
  const [morphProgress, setMorphProgress] = useState(0)
  const [strokeProgress, setStrokeProgress] = useState<Record<string, number>>({})
  const [erasedStrokes, setErasedStrokes] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(0)

  // Tool states
  const [pencilState, setPencilState] = useState({ x: -50, y: 300, rotation: 25, pressure: 0.5, visible: false, isDrawing: false })
  const [eraserState, setEraserState] = useState({ x: -100, y: 200, rotation: 0, visible: false, isErasing: false })
  const [tSquareState, setTSquareState] = useState({ visible: false, position: { x: 100, y: 95 }, rotation: 0 })
  const [triangleVisible, setTriangleVisible] = useState(false)
  const [compassState, setCompassState] = useState({ visible: false, isDrawing: false, arcProgress: 0 })
  const [technicalPenState, setTechnicalPenState] = useState({ visible: false, position: { x: 400, y: -100 }, rotation: -15, isDrawing: false })

  // Particles
  const [particles, setParticles] = useState<Particle[]>([])
  const particleIdRef = useRef(0)
  
  // Generate unique particle ID (combines counter + random to ensure uniqueness)
  const getUniqueParticleId = useCallback(() => {
    particleIdRef.current++
    return particleIdRef.current * 1000 + Math.floor(Math.random() * 999)
  }, [])

  // Interactive states
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, text: "" })
  const [hoverTime, setHoverTime] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [spinTriggered, setSpinTriggered] = useState(false)
  const [showSignature, setShowSignature] = useState(false)

  // Interpolators for path morphing
  const interpolators = useMemo(() => {
    const result: Record<string, (t: number) => string> = {}
    strokes.forEach((stroke) => {
      try {
        result[stroke.id] = interpolate(stroke.sketchy, stroke.clean, { maxSegmentLength: 3 })
      } catch {
        result[stroke.id] = (t: number) => (t < 0.5 ? stroke.sketchy : stroke.clean)
      }
    })
    return result
  }, [])

  // Handle replay
  const handleReplay = useCallback(() => {
    setCurrentTime(0)
    setPhase(PHASES.BLANK)
    setMorphProgress(0)
    setStrokeProgress({})
    setErasedStrokes(new Set())
    setParticles([])
    setPencilState({ x: -50, y: 300, rotation: 25, pressure: 0.5, visible: false, isDrawing: false })
    setEraserState({ x: -100, y: 200, rotation: 0, visible: false, isErasing: false })
    setTSquareState({ visible: false, position: { x: 100, y: 95 }, rotation: 0 })
    setTriangleVisible(false)
    setCompassState({ visible: false, isDrawing: false, arcProgress: 0 })
    setTechnicalPenState({ visible: false, position: { x: 400, y: -100 }, rotation: -15, isDrawing: false })
    setShowSignature(false)
    startTimeRef.current = null
    pausedTimeRef.current = 0
    setIsPlaying(true)
    setHasStarted(true)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setIsPlaying((p) => !p)
      } else if (e.code === "KeyR") {
        handleReplay()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleReplay])



  // Main animation loop
  useEffect(() => {
    if (!isInView || !isPlaying || prefersReducedMotion) {
      if (prefersReducedMotion) {
        setTimeout(() => {
          setPhase(PHASES.COMPLETE)
          setMorphProgress(1)
          strokes.forEach((stroke) => {
            setStrokeProgress((prev) => ({ ...prev, [stroke.id]: 1 }))
          })
        }, 0)

      }
      return
    }

    if (!hasStarted) {
      setTimeout(() => setHasStarted(true), 0)
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - pausedTimeRef.current * 1000
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000

      if (elapsed >= TOTAL_DURATION) {
        setCurrentTime(TOTAL_DURATION)
        setPhase(PHASES.COMPLETE)
        setShowSignature(true)
        return
      }

      setCurrentTime(elapsed)

      // Determine current phase
      let currentPhase: number = PHASES.BLANK
      for (const [phaseKey, timing] of Object.entries(PHASE_TIMINGS)) {
        if (elapsed >= timing.start && elapsed < timing.end) {
          currentPhase = parseInt(phaseKey) as number
          break
        }
      }
      if (elapsed >= PHASE_TIMINGS[PHASES.COMPLETE].start) {
        currentPhase = PHASES.COMPLETE as number
        setShowSignature(true)
      }
      setPhase(currentPhase)

      // Phase: Rough Sketch - Pencil draws along actual strokes
      if (elapsed >= PHASE_TIMINGS[PHASES.ROUGH_SKETCH].start && elapsed < PHASE_TIMINGS[PHASES.ROUGH_SKETCH].end) {
        const drawingProgress = (elapsed - PHASE_TIMINGS[PHASES.ROUGH_SKETCH].start) / (PHASE_TIMINGS[PHASES.ROUGH_SKETCH].end - PHASE_TIMINGS[PHASES.ROUGH_SKETCH].start)

        // Sort strokes by draw order and filter out erasable ones for main drawing
        const sortedStrokes = [...strokes].filter(s => !s.erasable).sort((a, b) => a.drawOrder - b.drawOrder)
        const totalDrawTime = sortedStrokes.reduce((sum, s) => sum + s.drawDuration, 0)

        // Find which stroke is currently being drawn and get pencil position along it
        let accumulatedTime = 0
        let currentStroke: StrokeDefinition | null = null
        let localStrokeProgress = 0

        for (const stroke of sortedStrokes) {
          const strokeStartProgress = accumulatedTime / totalDrawTime
          const strokeEndProgress = (accumulatedTime + stroke.drawDuration) / totalDrawTime

          if (drawingProgress >= strokeStartProgress && drawingProgress < strokeEndProgress) {
            currentStroke = stroke
            localStrokeProgress = (drawingProgress - strokeStartProgress) / (strokeEndProgress - strokeStartProgress)
            break
          } else if (drawingProgress >= strokeEndProgress) {
            // Stroke is complete
            setStrokeProgress((prev) => ({ ...prev, [stroke.id]: 1 }))
          }

          accumulatedTime += stroke.drawDuration
        }

        // Update progress for all strokes up to current point
        accumulatedTime = 0
        sortedStrokes.forEach((stroke) => {
          const strokeStartProgress = accumulatedTime / totalDrawTime
          const strokeEndProgress = (accumulatedTime + stroke.drawDuration) / totalDrawTime
          accumulatedTime += stroke.drawDuration

          if (drawingProgress >= strokeStartProgress) {
            const localProgress = Math.min(1, (drawingProgress - strokeStartProgress) / (strokeEndProgress - strokeStartProgress))
            setStrokeProgress((prev) => ({ ...prev, [stroke.id]: localProgress }))
          }
        })

        // Position pencil along the current stroke's actual path
        let pencilPos: PathPoint
        if (currentStroke) {
          pencilPos = getPointAlongPath(currentStroke.sketchy, localStrokeProgress)
        } else {
          // If no current stroke (drawing complete or not started), use waypoints fallback
          pencilPos = getPointAlongWaypoints(pencilWaypoints, drawingProgress)
        }

        // Calculate rotation based on movement direction
        const nextProgress = Math.min(1, drawingProgress + 0.01)
        let nextPos: PathPoint
        if (currentStroke) {
          const nextLocalProgress = Math.min(1, localStrokeProgress + 0.05)
          nextPos = getPointAlongPath(currentStroke.sketchy, nextLocalProgress)
        } else {
          nextPos = getPointAlongWaypoints(pencilWaypoints, nextProgress)
        }
        const angle = Math.atan2(nextPos.y - pencilPos.y, nextPos.x - pencilPos.x) * (180 / Math.PI) + 90

        setPencilState({
          x: pencilPos.x,
          y: pencilPos.y,
          rotation: 25 + angle * 0.3 + Math.sin(elapsed * 6) * 5,
          pressure: 0.3 + Math.sin(elapsed * 8) * 0.15,
          visible: true,
          isDrawing: true,
        })

        // Draw construction lines early (dashed guidelines)
        const constructionProgress = drawingProgress * 4
        strokes.filter(s => s.erasable).forEach((stroke, i) => {
          const localProgress = Math.min(1, Math.max(0, constructionProgress - i * 0.3))
          setStrokeProgress((prev) => ({ ...prev, [stroke.id]: localProgress }))
        })

        // Add pencil particles at the tip
        if (Math.random() > 0.6) {
          const particleId = getUniqueParticleId()
          setParticles((prev) => [
            ...prev.slice(-25),
            {
              id: particleId,
              x: pencilPos.x,
              y: pencilPos.y + 28,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * 2 + 1,
              life: 0.4 + Math.random() * 0.3,
              size: 1 + Math.random() * 2,
              type: "pencil",
            },
          ])
        }
      }

      // Phase: Annotation - pencil writes notes
      if (elapsed >= PHASE_TIMINGS[PHASES.ANNOTATION].start && elapsed < PHASE_TIMINGS[PHASES.ANNOTATION].end) {
        const annotationProgress = (elapsed - PHASE_TIMINGS[PHASES.ANNOTATION].start) / (PHASE_TIMINGS[PHASES.ANNOTATION].end - PHASE_TIMINGS[PHASES.ANNOTATION].start)

        // Move pencil to annotation positions
        const currentAnnotation = Math.floor(annotationProgress * sketchAnnotations.length)
        const anno = sketchAnnotations[Math.min(currentAnnotation, sketchAnnotations.length - 1)]

        setPencilState({
          x: anno.x,
          y: anno.y,
          rotation: anno.rotation + 25,
          pressure: 0.4,
          visible: true,
          isDrawing: annotationProgress % 0.25 < 0.2,
        })
      }

      // Phase: Erasing - eraser removes construction lines, then pencil refines
      if (elapsed >= PHASE_TIMINGS[PHASES.ERASING].start && elapsed < PHASE_TIMINGS[PHASES.ERASING].end) {
        const phaseProgress = (elapsed - PHASE_TIMINGS[PHASES.ERASING].start) / (PHASE_TIMINGS[PHASES.ERASING].end - PHASE_TIMINGS[PHASES.ERASING].start)

        // First 60% of phase: Erasing
        // Last 40% of phase: Pencil refinement
        const erasingEndProgress = 0.6
        const refinementStartProgress = 0.6

        if (phaseProgress < erasingEndProgress) {
          // ERASING SUB-PHASE: Eraser follows actual erasable stroke paths
          const eraserProgress = phaseProgress / erasingEndProgress

          // Hide pencil during erasing
          setPencilState((prev) => ({ ...prev, visible: false, isDrawing: false }))

          // Get erasable strokes
          const erasableStrokes = strokes.filter(s => s.erasable)
          const totalEraseDuration = erasableStrokes.length

          // Find which erasable stroke eraser is currently on
          let currentErasableStroke: StrokeDefinition | null = null
          let localEraseProgress = 0

          for (let i = 0; i < erasableStrokes.length; i++) {
            const strokeStartProgress = i / totalEraseDuration
            const strokeEndProgress = (i + 1) / totalEraseDuration

            if (eraserProgress >= strokeStartProgress && eraserProgress < strokeEndProgress) {
              currentErasableStroke = erasableStrokes[i]
              localEraseProgress = (eraserProgress - strokeStartProgress) / (strokeEndProgress - strokeStartProgress)
              break
            }
          }

          // Position eraser along the current erasable stroke's path
          let eraserPos: PathPoint
          if (currentErasableStroke) {
            eraserPos = getPointAlongPath(currentErasableStroke.sketchy, localEraseProgress)
          } else {
            eraserPos = getPointAlongWaypoints(eraserWaypoints, eraserProgress)
          }

          // Calculate rotation based on movement
          let nextEraserPos: PathPoint
          if (currentErasableStroke) {
            nextEraserPos = getPointAlongPath(currentErasableStroke.sketchy, Math.min(1, localEraseProgress + 0.1))
          } else {
            nextEraserPos = getPointAlongWaypoints(eraserWaypoints, Math.min(1, eraserProgress + 0.05))
          }
          const eraserAngle = Math.atan2(nextEraserPos.y - eraserPos.y, nextEraserPos.x - eraserPos.x) * (180 / Math.PI)

          setEraserState({
            x: eraserPos.x,
            y: eraserPos.y,
            rotation: eraserAngle * 0.3 + Math.sin(eraserProgress * Math.PI * 8) * 8,
            visible: true,
            isErasing: eraserProgress > 0.05 && eraserProgress < 0.95,
          })

          // Erase construction lines as eraser passes over them
          erasableStrokes.forEach((stroke, i) => {
            const strokeEndProgress = (i + 1) / totalEraseDuration
            if (eraserProgress >= strokeEndProgress - 0.05) {
              setErasedStrokes((prev) => new Set(prev).add(stroke.id))
            }
          })

          // Add eraser particles
          if (eraserProgress > 0.05 && eraserProgress < 0.95 && Math.random() > 0.5) {
            const particleId = getUniqueParticleId()
            setParticles((prev) => [
              ...prev.slice(-30),
              {
                id: particleId,
                x: eraserPos.x + (Math.random() - 0.5) * 40,
                y: eraserPos.y + 15,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2,
                life: 0.5,
                size: 2 + Math.random() * 3,
                type: "shaving",
                color: "#FFCDD2",
              },
            ])
          }
        } else {
          // REFINEMENT SUB-PHASE: Pencil comes back and adds detail strokes
          const refinementProgress = (phaseProgress - refinementStartProgress) / (1 - refinementStartProgress)

          // Hide eraser
          setEraserState((prev) => ({ ...prev, visible: false, isErasing: false }))

          // Define refinement strokes - small detail touches the pencil adds
          const refinementStrokes = [
            strokes.find(s => s.id === "hotend"),
            strokes.find(s => s.id === "nozzle"),
            strokes.find(s => s.id === "screenContent"),
            strokes.find(s => s.id === "printedObject"),
          ].filter(Boolean) as StrokeDefinition[]

          // Find which refinement stroke is being drawn
          const strokeIndex = Math.floor(refinementProgress * refinementStrokes.length)
          const currentRefinementStroke = refinementStrokes[Math.min(strokeIndex, refinementStrokes.length - 1)]
          const localRefinementProgress = (refinementProgress * refinementStrokes.length) - strokeIndex

          // Position pencil along refinement stroke
          let pencilPos: PathPoint
          if (currentRefinementStroke && localRefinementProgress >= 0 && localRefinementProgress <= 1) {
            pencilPos = getPointAlongPath(currentRefinementStroke.sketchy, Math.min(1, Math.max(0, localRefinementProgress)))
          } else {
            pencilPos = { x: 400, y: 200 }
          }

          // Calculate rotation
          const nextRefinementProgress = Math.min(1, localRefinementProgress + 0.1)
          let nextPencilPos: PathPoint
          if (currentRefinementStroke) {
            nextPencilPos = getPointAlongPath(currentRefinementStroke.sketchy, nextRefinementProgress)
          } else {
            nextPencilPos = pencilPos
          }
          const pencilAngle = Math.atan2(nextPencilPos.y - pencilPos.y, nextPencilPos.x - pencilPos.x) * (180 / Math.PI) + 90

          setPencilState({
            x: pencilPos.x,
            y: pencilPos.y,
            rotation: 25 + pencilAngle * 0.3 + Math.sin(elapsed * 8) * 3,
            pressure: 0.4 + Math.sin(elapsed * 10) * 0.1,
            visible: true,
            isDrawing: refinementProgress > 0.05 && refinementProgress < 0.95,
          })

          // Add pencil particles during refinement
          if (refinementProgress > 0.1 && refinementProgress < 0.9 && Math.random() > 0.7) {
            const particleId = getUniqueParticleId()
            setParticles((prev) => [
              ...prev.slice(-20),
              {
                id: particleId,
                x: pencilPos.x,
                y: pencilPos.y + 28,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 1.5,
                life: 0.3,
                size: 1 + Math.random() * 1.5,
                type: "pencil",
              },
            ])
          }
        }
      } else {
        setEraserState((prev) => ({ ...prev, visible: false, isErasing: false }))
      }

      // Phase: Tools
      if (elapsed >= PHASE_TIMINGS[PHASES.TOOLS].start && elapsed < PHASE_TIMINGS[PHASES.TOOLS].end) {
        const toolsProgress = (elapsed - PHASE_TIMINGS[PHASES.TOOLS].start) / (PHASE_TIMINGS[PHASES.TOOLS].end - PHASE_TIMINGS[PHASES.TOOLS].start)

        // T-square slides in and moves
        if (toolsProgress > 0.05) {
          setTSquareState({
            visible: true,
            position: {
              x: 100,
              y: 95 + Math.sin(toolsProgress * Math.PI) * 150,
            },
            rotation: 0,
          })
        }

        setTriangleVisible(toolsProgress > 0.25)

        // Compass draws arc
        const compassDrawing = toolsProgress > 0.4 && toolsProgress < 0.8
        setCompassState({
          visible: toolsProgress > 0.4,
          isDrawing: compassDrawing,
          arcProgress: compassDrawing ? (toolsProgress - 0.4) / 0.4 : toolsProgress >= 0.8 ? 1 : 0,
        })

        setTechnicalPenState({
          visible: toolsProgress > 0.6,
          position: { x: 400 + (toolsProgress - 0.6) * 300, y: 150 },
          rotation: -15,
          isDrawing: false,
        })
      }

      // Phase: Transform
      if (elapsed >= PHASE_TIMINGS[PHASES.TRANSFORM].start && elapsed < PHASE_TIMINGS[PHASES.TRANSFORM].end) {
        const transformProgress = (elapsed - PHASE_TIMINGS[PHASES.TRANSFORM].start) / (PHASE_TIMINGS[PHASES.TRANSFORM].end - PHASE_TIMINGS[PHASES.TRANSFORM].start)

        // Cubic easing for smooth morph
        const easedProgress = transformProgress < 0.5
          ? 4 * transformProgress * transformProgress * transformProgress
          : 1 - Math.pow(-2 * transformProgress + 2, 3) / 2

        setMorphProgress(easedProgress)

        // Hide other tools, show technical pen
        setTSquareState((prev) => ({ ...prev, visible: transformProgress < 0.3 }))
        setTriangleVisible(transformProgress < 0.3)
        setCompassState((prev) => ({ ...prev, visible: transformProgress < 0.2 }))

        // Technical pen draws clean lines
        setTechnicalPenState({
          visible: true,
          position: {
            x: 150 + transformProgress * 500,
            y: 100 + Math.sin(transformProgress * Math.PI * 3) * 200,
          },
          rotation: -15 + Math.sin(transformProgress * Math.PI * 5) * 12,
          isDrawing: true,
        })

        // Ink splatter particles during transform
        if (Math.random() > 0.7) {
          const particleId = getUniqueParticleId()
          const splatterX = 100 + Math.random() * 600
          const splatterY = 100 + Math.random() * 350
          setParticles((prev) => [
            ...prev.slice(-50),
            {
              id: particleId,
              x: splatterX,
              y: splatterY,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 0.5 + Math.random() * 0.4,
              size: 2 + Math.random() * 5,
              type: "ink",
              color: `rgba(0, ${180 + Math.random() * 75}, 255, ${0.4 + Math.random() * 0.5})`,
            },
          ])
        }
      }

      // Phase: Dimensions
      if (elapsed >= PHASE_TIMINGS[PHASES.DIMENSIONS].start && elapsed < PHASE_TIMINGS[PHASES.DIMENSIONS].end) {
        setMorphProgress(1)
        setTechnicalPenState((prev) => ({ ...prev, visible: false }))
      }

      // Phase: Complete
      if (elapsed >= PHASE_TIMINGS[PHASES.COMPLETE].start) {
        setMorphProgress(1)
        setTSquareState((prev) => ({ ...prev, visible: false }))
        setTriangleVisible(false)
        setCompassState((prev) => ({ ...prev, visible: false }))
        setTechnicalPenState((prev) => ({ ...prev, visible: false }))
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isInView, isPlaying, hasStarted, prefersReducedMotion, getUniqueParticleId])

  // Pause handling
  useEffect(() => {
    if (!isPlaying && currentTime > 0) {
      pausedTimeRef.current = currentTime
      startTimeRef.current = null
    }
  }, [isPlaying, currentTime])

  // Get interpolated path
  const getPath = useCallback(
    (strokeId: string) => {
      const stroke = strokes.find((s) => s.id === strokeId)
      if (!stroke) return ""

      if (phase < PHASES.TRANSFORM) {
        return stroke.sketchy
      } else if (phase >= PHASES.DIMENSIONS) {
        return stroke.clean
      }

      return interpolators[strokeId]?.(morphProgress) || stroke.sketchy
    },
    [phase, morphProgress, interpolators]
  )

  // Handle path click for tooltip
  const handlePathClick = useCallback((stroke: StrokeDefinition, event: React.MouseEvent) => {
    if (phase >= PHASES.COMPLETE && stroke.tooltip) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          text: stroke.tooltip,
        })
        setTimeout(() => setTooltip((prev) => ({ ...prev, visible: false })), 3000)
      }
    }
  }, [phase])

  // Easter eggs
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (phase === PHASES.COMPLETE && hoverTime > 0) {
      interval = setInterval(() => {
        setHoverTime((prev) => {
          if (prev >= 3) {
            setShowEasterEgg(true)
            return prev
          }
          return prev + 0.1
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [phase, hoverTime])

  useEffect(() => {
    if (clickCount >= 5 && !spinTriggered) {
      setTimeout(() => setSpinTriggered(true), 0)
      setTimeout(() => {
        setClickCount(0)
        setSpinTriggered(false)
      }, 2000)
    }
  }, [clickCount, spinTriggered])

  // Visual states
  const isSketchPhase = phase < PHASES.TRANSFORM
  const isBlueprintPhase = phase >= PHASES.DIMENSIONS
  // Use theme-aware colors - interpolate from sketch color to cyan
  const sketchColorRgb = isDarkMode ? { r: 136, g: 136, b: 136 } : { r: 68, g: 68, b: 68 }
  const strokeColor = isBlueprintPhase
    ? "#00D4FF"
    : isSketchPhase
    ? sketchStrokeColor
    : `rgb(${Math.round(sketchColorRgb.r + morphProgress * (0 - sketchColorRgb.r))}, ${Math.round(sketchColorRgb.g + morphProgress * (212 - sketchColorRgb.g))}, ${Math.round(sketchColorRgb.b + morphProgress * (255 - sketchColorRgb.b))})`
  const strokeWidth = isBlueprintPhase ? 1.5 : isSketchPhase ? 2.5 : 2.5 - morphProgress

  // Get phase name
  const getPhaseName = () => {
    const names = ["Blank", "Sketching", "Annotating", "Erasing", "Tools", "Transform", "Dimensions", "Complete"]
    return names[phase] || "..."
  }

  // Caption
  const getCaption = () => {
    switch (phase) {
      case PHASES.BLANK: return "Every invention begins with a blank page..."
      case PHASES.ROUGH_SKETCH: return "First, the rough sketch - imperfect, exploratory, alive..."
      case PHASES.ANNOTATION: return "Quick notes capture fleeting ideas before they escape..."
      case PHASES.ERASING: return "Then refinement - removing the scaffolding, keeping the vision..."
      case PHASES.TOOLS: return "Precision tools transform chaos into order..."
      case PHASES.TRANSFORM: return "The metamorphosis from idea to blueprint..."
      case PHASES.DIMENSIONS: return "Every dimension tells a story of constraints conquered..."
      case PHASES.COMPLETE: return "...to engineered reality. (Click parts for specs)"
      default: return ""
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto my-12 select-none"
      onMouseEnter={() => phase === PHASES.COMPLETE && setHoverTime(0.1)}
      onMouseLeave={() => {
        setHoverTime(0)
        setTooltip((prev) => ({ ...prev, visible: false }))
        if (showEasterEgg) setTimeout(() => setShowEasterEgg(false), 4000)
      }}
      onClick={() => setClickCount((c) => c + 1)}
    >
      {/* Background transition - theme aware */}
      <motion.div
        className="absolute inset-0 rounded-xl overflow-hidden"
        initial={{ backgroundColor: paperColor }}
        animate={{ backgroundColor: phase >= PHASES.TRANSFORM ? blueprintBgColor : paperColor }}
        transition={{ duration: 2 }}
      />

      {/* Paper texture */}
      <AnimatePresence>
        {phase < PHASES.TRANSFORM && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Coffee ring easter egg */}
      <AnimatePresence>
        {phase >= PHASES.ROUGH_SKETCH && phase < PHASES.TRANSFORM && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: `${(coffeeRing.cx / 800) * 100}%`,
              top: `${(coffeeRing.cy / 550) * 100}%`,
              width: coffeeRing.r * 2,
              height: coffeeRing.r * 2,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: coffeeRing.opacity, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 4, duration: 1.5 }}
          >
            <svg viewBox="0 0 60 60" className="w-full h-full">
              <circle cx="30" cy="30" r="26" fill="none" stroke="#8B4513" strokeWidth="4" opacity="0.35" />
              <circle cx="30" cy="30" r="24" fill="none" stroke="#8B4513" strokeWidth="2" opacity="0.2" />
              <ellipse cx="30" cy="30" rx="28" ry="26" fill="none" stroke="#8B4513" strokeWidth="1" opacity="0.15" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blueprint grid */}
      <motion.div
        className="absolute inset-0 blueprint-grid rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= PHASES.TRANSFORM ? 0.35 * morphProgress : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Scan line */}
      <ScanLine active={phase >= PHASES.DIMENSIONS} />

      {/* Tooltip */}
      <AnimatePresence>
        <Tooltip tooltip={tooltip} />
      </AnimatePresence>

      {/* Main SVG */}
      <motion.svg
        viewBox="0 0 800 550"
        className="relative z-10 w-full h-auto p-4"
        animate={{ rotate: spinTriggered ? 360 : 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <defs>
          <filter id="sketchy" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" result="noise" seed="3" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={isSketchPhase ? 2.5 : 0} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ParticleSystem particles={particles} />

        {/* Main paths */}
        <g style={{ filter: isSketchPhase ? "url(#sketchy)" : phase >= PHASES.DIMENSIONS ? "url(#glow)" : "none" }}>
          {strokes.map((stroke) => {
            // Skip erased strokes
            if (erasedStrokes.has(stroke.id)) return null

            return (
              <motion.path
                key={stroke.id}
                d={getPath(stroke.id)}
                stroke={stroke.erasable ? "#999" : strokeColor}
                strokeWidth={stroke.erasable ? 1 : strokeWidth}
                fill={stroke.category === "object" && isBlueprintPhase ? "rgba(0, 212, 255, 0.15)" : "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={stroke.erasable ? "8 4" : "none"}
                opacity={stroke.erasable ? 0.5 : 1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: strokeProgress[stroke.id] || 0 }}
                transition={{ duration: 0.1, ease: "linear" }}
                onClick={(e) => handlePathClick(stroke, e)}
                className={phase >= PHASES.COMPLETE && stroke.tooltip ? "cursor-pointer hover:opacity-80" : ""}
              />
            )
          })}
        </g>

        {/* Sketch annotations */}
        <AnimatePresence>
          {phase >= PHASES.ANNOTATION && phase < PHASES.TRANSFORM && (
            <g>
              {sketchAnnotations.map((anno, i) => (
                <motion.text
                  key={i}
                  x={anno.x}
                  y={anno.y}
                  fill="#555"
                  fontSize="13"
                  fontFamily="'Comic Sans MS', cursive, sans-serif"
                  transform={`rotate(${anno.rotation} ${anno.x} ${anno.y})`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: (phase >= PHASES.ANNOTATION ? 0 : anno.delay) + i * 0.3, duration: 0.4 }}
                >
                  {anno.text}
                </motion.text>
              ))}
            </g>
          )}
        </AnimatePresence>

        {/* Tools */}
        <TSquare visible={tSquareState.visible} position={tSquareState.position} rotation={tSquareState.rotation} />
        <Triangle visible={triangleVisible} position={{ x: 620, y: 280 }} rotation={-12} />
        <Compass visible={compassState.visible} position={{ x: 700, y: 180 }} rotation={0} spread={22} isDrawing={compassState.isDrawing} arcProgress={compassState.arcProgress} />
        <TechnicalPen {...technicalPenState} />
        <Pencil {...pencilState} />
        <Eraser {...eraserState} />

        {/* Dimension lines */}
        <AnimatePresence>
          {phase >= PHASES.DIMENSIONS && (
            <g filter="url(#glow)">
              {dimensionLines.map((dim) => (
                <g key={dim.id}>
                  {dim.vertical ? (
                    <>
                      <motion.line x1={dim.x1 + 20} y1={dim.y1} x2={dim.x1} y2={dim.y1} stroke="#00D4FF" strokeWidth={0.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: dim.delay + 0.5, duration: 0.3 }} />
                      <motion.line x1={dim.x1 + 20} y1={dim.y2} x2={dim.x1} y2={dim.y2} stroke="#00D4FF" strokeWidth={0.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: dim.delay + 0.5, duration: 0.3 }} />
                    </>
                  ) : (
                    <>
                      <motion.line x1={dim.x1} y1={dim.y1 - 20} x2={dim.x1} y2={dim.y1} stroke="#00D4FF" strokeWidth={0.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: dim.delay + 0.5, duration: 0.3 }} />
                      <motion.line x1={dim.x2} y1={dim.y2 - 20} x2={dim.x2} y2={dim.y2} stroke="#00D4FF" strokeWidth={0.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: dim.delay + 0.5, duration: 0.3 }} />
                    </>
                  )}
                  <motion.line x1={dim.x1} y1={dim.y1} x2={dim.x2} y2={dim.y2} stroke="#00D4FF" strokeWidth={0.75} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: dim.delay + 0.8, duration: 0.5 }} />
                  {dim.vertical ? (
                    <>
                      <motion.path d={`M${dim.x1 - 3} ${dim.y1 + 8} L${dim.x1} ${dim.y1} L${dim.x1 + 3} ${dim.y1 + 8}`} stroke="#00D4FF" strokeWidth={0.75} fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dim.delay + 1.3 }} />
                      <motion.path d={`M${dim.x1 - 3} ${dim.y2 - 8} L${dim.x1} ${dim.y2} L${dim.x1 + 3} ${dim.y2 - 8}`} stroke="#00D4FF" strokeWidth={0.75} fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dim.delay + 1.3 }} />
                    </>
                  ) : (
                    <>
                      <motion.path d={`M${dim.x1 + 8} ${dim.y1 - 3} L${dim.x1} ${dim.y1} L${dim.x1 + 8} ${dim.y1 + 3}`} stroke="#00D4FF" strokeWidth={0.75} fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dim.delay + 1.3 }} />
                      <motion.path d={`M${dim.x2 - 8} ${dim.y2 - 3} L${dim.x2} ${dim.y2} L${dim.x2 - 8} ${dim.y2 + 3}`} stroke="#00D4FF" strokeWidth={0.75} fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dim.delay + 1.3 }} />
                    </>
                  )}
                  <motion.text x={dim.vertical ? dim.x1 - 15 : (dim.x1 + dim.x2) / 2} y={dim.vertical ? (dim.y1 + dim.y2) / 2 : dim.y1 + 15} fill="#00D4FF" fontSize="10" fontFamily="monospace" textAnchor="middle" transform={dim.vertical ? `rotate(-90 ${dim.x1 - 15} ${(dim.y1 + dim.y2) / 2})` : ""} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dim.delay + 1.5 }}>
                    {dim.label}
                  </motion.text>
                </g>
              ))}
            </g>
          )}
        </AnimatePresence>

        {/* Callouts */}
        <AnimatePresence>
          {phase >= PHASES.DIMENSIONS && (
            <g>
              {callouts.map((callout) => (
                <g key={callout.id}>
                  <motion.line x1={callout.targetX} y1={callout.targetY} x2={callout.x} y2={callout.y} stroke="#00D4FF" strokeWidth={0.5} strokeDasharray="4 2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: callout.delay + 2, duration: 0.4 }} />
                  <motion.circle cx={callout.targetX} cy={callout.targetY} r="3" fill="#00D4FF" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: callout.delay + 2.4, type: "spring" }} />
                  <motion.text x={callout.x} y={callout.y - 5} fill="#00D4FF" fontSize="8" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: callout.delay + 2.5 }}>
                    {callout.text}
                  </motion.text>
                </g>
              ))}
            </g>
          )}
        </AnimatePresence>

        {/* Title block */}
        <AnimatePresence>
          {phase >= PHASES.COMPLETE && (
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}>
              <rect x="580" y="430" width="200" height="105" stroke="#00D4FF" strokeWidth={1.5} fill="rgba(0, 20, 48, 0.9)" filter="url(#glow)" />
              <line x1="580" y1="450" x2="780" y2="450" stroke="#00D4FF" strokeWidth={0.5} />
              <line x1="580" y1="475" x2="780" y2="475" stroke="#00D4FF" strokeWidth={0.5} />
              <line x1="580" y1="500" x2="780" y2="500" stroke="#00D4FF" strokeWidth={0.5} />
              <line x1="700" y1="500" x2="700" y2="535" stroke="#00D4FF" strokeWidth={0.5} />
              <line x1="580" y1="500" x2="580" y2="535" stroke="#00D4FF" strokeWidth={0.5} />
              <motion.text x="590" y="444" fill="#00D4FF" fontSize="9" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1.3 }}>DESIGNED BY:</motion.text>
              <motion.text x="590" y="468" fill="#00D4FF" fontSize="14" fontWeight="bold" fontFamily="monospace" filter="url(#strongGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>D. HERNANDEZ</motion.text>
              <motion.text x="590" y="492" fill="#00D4FF" fontSize="10" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>FDM 3D PRINTER - REV 3.2</motion.text>
              <motion.text x="590" y="514" fill="#00D4FF" fontSize="9" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1.9 }}>SCALE: 1:10</motion.text>
              <motion.text x="710" y="514" fill="#00D4FF" fontSize="9" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 2.1 }}>DATE: 2024</motion.text>
              <path d="M580 430 L590 430 L580 440 Z" fill="#00D4FF" opacity={0.5} />
              <path d="M780 430 L770 430 L780 440 Z" fill="#00D4FF" opacity={0.5} />
              <path d="M580 535 L590 535 L580 525 Z" fill="#00D4FF" opacity={0.5} />
              <path d="M780 535 L770 535 L780 525 Z" fill="#00D4FF" opacity={0.5} />

              {/* Signature label and hand-drawn signature in dedicated row */}
              <motion.text x="590" y="530" fill="#00D4FF" fontSize="7" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2.3 }}>SIGNATURE:</motion.text>
              {showSignature && (
                <motion.path
                  d="M645 522 Q655 515 665 522 Q678 535 688 518 Q695 505 710 522 L725 530 Q732 518 745 530"
                  stroke="#00D4FF"
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 2.5, duration: 1.2, ease: "easeInOut" }}
                />
              )}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Approval stamp */}
        <AnimatePresence>
          {phase >= PHASES.COMPLETE && (
            <motion.g initial={{ opacity: 0, scale: 0.7, rotate: -20 }} animate={{ opacity: 0.18, scale: 1, rotate: -15 }} transition={{ delay: 3, duration: 0.6 }}>
              <circle cx="200" cy="350" r="65" stroke="#00D4FF" strokeWidth={3.5} fill="none" />
              <text x="200" y="345" textAnchor="middle" fill="#00D4FF" fontSize="13" fontWeight="bold" fontFamily="monospace">APPROVED</text>
              <text x="200" y="362" textAnchor="middle" fill="#00D4FF" fontSize="9" fontFamily="monospace">FOR PRODUCTION</text>
            </motion.g>
          )}
        </AnimatePresence>
      </motion.svg>

      {/* Phase indicator */}
      <div className="absolute top-4 left-4 flex gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((p) => (
          <motion.div
            key={p}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: phase >= p ? (phase >= PHASES.TRANSFORM ? "#00D4FF" : "#666") : "#ccc",
              scale: phase === p ? 1.4 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Control panel */}
      <ControlPanel
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onReplay={handleReplay}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        progress={currentTime / TOTAL_DURATION}
        phaseName={getPhaseName()}
      />

      {/* Caption */}
      <motion.p
        className="text-center mt-4 text-sm italic px-4 min-h-[24px]"
        animate={{ color: phase >= PHASES.TRANSFORM ? "#00D4FF" : "#555" }}
        transition={{ duration: 0.5 }}
        key={phase}
        initial={{ opacity: 0, y: 10 }}
      >
        {getCaption()}
      </motion.p>

      {/* Progress bar */}
      <div className="mx-4 mt-2 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: phase >= PHASES.TRANSFORM
              ? "linear-gradient(90deg, #00D4FF, #00E5FF)"
              : "linear-gradient(90deg, #666, #888)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Keyboard hints */}
      <motion.p
        className="text-center mt-2 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: hasStarted ? 0.6 : 0 }}
        transition={{ delay: 3 }}
      >
        Space to pause • R to replay • Click parts for specs
      </motion.p>

      {/* Technical explanation - tiny, expands on hover */}
      <motion.div
        className="mt-6 mx-auto max-w-md group cursor-help"
        initial={{ opacity: 0 }}
        animate={{ opacity: hasStarted ? 1 : 0 }}
        transition={{ delay: 5 }}
      >
        <p className="text-[9px] leading-relaxed text-muted-foreground/40 text-center transition-all duration-500 group-hover:text-[11px] group-hover:text-muted-foreground/70 group-hover:leading-relaxed">
          This animation runs entirely in your browser — no video files, no pre-recorded footage.
          Every line is drawn in real-time by code that tracks tool positions, calculates path intersections,
          and smoothly transforms hand-drawn shapes into technical drawings. The pencil and eraser
          follow the actual strokes as they appear, just like watching someone sketch.
          It's the kind of detail most people won't notice, but I enjoy building things that feel alive.
        </p>
      </motion.div>

      {/* Easter egg toasts */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-lg text-sm shadow-lg border border-cyan-500/30 whitespace-nowrap z-50"
          >
            I've filled notebooks with sketches like this. Most never get built. But some do.
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {spinTriggered && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 bg-purple-900/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm shadow-lg border border-purple-500/30 z-50"
          >
            Whee! You found a spin!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
