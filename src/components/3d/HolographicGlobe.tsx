import { Viewer, Entity, PointGraphics, PolylineGraphics, EllipseGraphics } from "resium"
import { Cartesian3, Color, type Viewer as CesiumViewer, CallbackProperty, PolylineGlowMaterialProperty, ColorMaterialProperty } from "cesium"
import { useState, useEffect, useRef, useCallback } from "react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw, Rocket, Zap, Clock } from "lucide-react"

interface LocationPin {
  id: string
  name: string
  label: string
  lat: number
  lon: number
  color: typeof Color.CYAN
  title: string
  body: string
  subtext?: string
  year?: string
}

const LOCATIONS: LocationPin[] = [
  {
    id: "albuquerque",
    name: "Albuquerque, NM",
    label: "Origin",
    lat: 35.0844,
    lon: -106.6504,
    color: Color.CYAN,
    title: "Where It All Started",
    body: "Born here. Don't remember much—just that one time I almost strangled myself on a clothesline doing tricks. Good times.",
    year: "1990",
  },
  {
    id: "charleston",
    name: "Charleston, IL",
    label: "Foundation",
    lat: 39.4961,
    lon: -88.1761,
    color: Color.MAGENTA,
    title: "The Hustle Years",
    body: "First businesses • Phones For Fast Cash HQ • Flying Colors Paintball • Lake Land College • App Academy (remote)",
    subtext: "This is where I learned that hard work beats talent when talent doesn't work hard.",
    year: "2008",
  },
  {
    id: "denver",
    name: "Denver, CO",
    label: "Growth",
    lat: 39.7392,
    lon: -104.9903,
    color: Color.YELLOW,
    title: "The Professional Chapter",
    body: "Charter Communications • First American • Tailored Technologies HQ",
    subtext: "Moved here alone, slept on my uncle's couch, applied to 100 jobs a day until something stuck.",
    year: "2016",
  },
  {
    id: "chicago",
    name: "Chicago, IL",
    label: "Enterprise",
    lat: 41.8781,
    lon: -87.6298,
    color: Color.LIME,
    title: "Finance Sector",
    body: "Mesirow Financial • Wealth management platform modernization",
    year: "2020",
  },
  {
    id: "grandrapids",
    name: "Grand Rapids, MI",
    label: "Defense",
    lat: 42.9634,
    lon: -85.6681,
    color: Color.ORANGE,
    title: "Department of Defense",
    body: "BrainGu • Space Force • Air Force • Navy applications",
    subtext: "Ironic that I built 3D tracking systems like this globe for the government.",
    year: "2022",
  },
  {
    id: "secret",
    name: "Secret Location",
    label: "🥚",
    lat: 0,
    lon: -160,
    color: Color.fromCssColorString("#7B2DFF"),
    title: "You found the secret pin!",
    body: "🥚 This is where I keep my best ideas. (Just kidding, it's mostly unfinished side projects.)",
  },
]

// Journey path coordinates (excluding secret location)
const JOURNEY_PATH = LOCATIONS.filter(l => l.id !== "secret").map(l =>
  Cartesian3.fromDegrees(l.lon, l.lat, 50000)
)

// Starlink-style satellite constellation
const SATELLITE_COUNT = 12
const generateSatellites = () => {
  return Array.from({ length: SATELLITE_COUNT }, (_, i) => ({
    id: `sat-${i}`,
    inclination: 53 + (Math.random() * 10 - 5),
    phase: (i / SATELLITE_COUNT) * 360,
    altitude: 550000 + Math.random() * 50000,
    speed: 0.8 + Math.random() * 0.4,
  }))
}

// Major cities for night lights effect
const MAJOR_CITIES = [
  { lat: 40.7128, lon: -74.006, name: "New York" },
  { lat: 34.0522, lon: -118.2437, name: "Los Angeles" },
  { lat: 51.5074, lon: -0.1278, name: "London" },
  { lat: 35.6762, lon: 139.6503, name: "Tokyo" },
  { lat: 48.8566, lon: 2.3522, name: "Paris" },
  { lat: -33.8688, lon: 151.2093, name: "Sydney" },
  { lat: 55.7558, lon: 37.6173, name: "Moscow" },
  { lat: 19.4326, lon: -99.1332, name: "Mexico City" },
  { lat: -23.5505, lon: -46.6333, name: "São Paulo" },
  { lat: 31.2304, lon: 121.4737, name: "Shanghai" },
  { lat: 28.6139, lon: 77.209, name: "Delhi" },
  { lat: 1.3521, lon: 103.8198, name: "Singapore" },
  { lat: 25.2048, lon: 55.2708, name: "Dubai" },
  { lat: 52.52, lon: 13.405, name: "Berlin" },
  { lat: 37.5665, lon: 126.978, name: "Seoul" },
]

// UFO paths (rare easter egg)
const UFO_PATHS = [
  { startLat: 60, startLon: -120, endLat: 30, endLon: -60 },
  { startLat: -40, startLon: 100, endLat: 10, endLon: 160 },
  { startLat: 45, startLon: 20, endLat: -20, endLon: 80 },
]

const ISS_ORBITAL_PERIOD = 92.68

export function HolographicGlobe(props: ComponentProps<"div">) {
  const [mounted, setMounted] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationPin | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isPlayingJourney, setIsPlayingJourney] = useState(false)
  const [journeyIndex, setJourneyIndex] = useState(0)
  const [showJourneyPath, setShowJourneyPath] = useState(true)
  const [issPosition, setIssPosition] = useState<Cartesian3 | null>(null)
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; start: Cartesian3; end: Cartesian3 }>>([])
  const [satellites, setSatellites] = useState<Array<{ id: string; position: Cartesian3 }>>([])
  const [dataPulses, setDataPulses] = useState<Array<{ id: number; lat: number; lon: number; radius: number; opacity: number }>>([])
  const [showCityLights, setShowCityLights] = useState(true)
  const [ufo, setUfo] = useState<{ position: Cartesian3; visible: boolean } | null>(null)
  const [rocketLaunch, setRocketLaunch] = useState<{ position: Cartesian3; altitude: number } | null>(null)
  const [timeSpeed, setTimeSpeed] = useState(1)
  const [scanLine, setScanLine] = useState(0)
  const [comet, setComet] = useState<{ start: Cartesian3; end: Cartesian3; visible: boolean } | null>(null)

  const viewerRef = useRef<{ cesiumElement?: CesiumViewer } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastSpinTime = useRef<number>(0)
  const spinCount = useRef<number>(0)
  const initialFlyDone = useRef(false)
  const zoomEasterEggShown = useRef(false)
  const satelliteData = useRef(generateSatellites())
  const ufoShown = useRef(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 0)
  }, [])

  // Initial camera fly and setup
  useEffect(() => {
    if (!mounted || initialFlyDone.current) return

    const checkViewer = setInterval(() => {
      const viewer = viewerRef.current?.cesiumElement
      if (viewer && viewer.scene && viewer.camera) {
        if (viewer.scene.moon) viewer.scene.moon.show = true
        if (viewer.scene.sun) viewer.scene.sun.show = true
        if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true
        viewer.scene.globe.enableLighting = true

        if (!initialFlyDone.current) {
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(-98, 38, 12000000),
            duration: 2,
          })
          initialFlyDone.current = true
        }

        clearInterval(checkViewer)
      }
    }, 100)

    return () => clearInterval(checkViewer)
  }, [mounted])

  // Simulated ISS position
  useEffect(() => {
    if (!mounted) return

    const updateISS = () => {
      const now = Date.now() * timeSpeed
      const orbitProgress = (now % (ISS_ORBITAL_PERIOD * 60 * 1000)) / (ISS_ORBITAL_PERIOD * 60 * 1000)
      const angle = orbitProgress * 360
      const inclination = 51.6
      const lat = inclination * Math.sin((angle * Math.PI) / 180)
      const lon = (angle * 2 - 180) % 360 - 180

      setIssPosition(Cartesian3.fromDegrees(lon, lat, 408000))
    }

    updateISS()
    const interval = setInterval(updateISS, 1000)
    return () => clearInterval(interval)
  }, [mounted, timeSpeed])

  // Satellite constellation animation
  useEffect(() => {
    if (!mounted) return

    const updateSatellites = () => {
      const now = Date.now() * timeSpeed
      const newPositions = satelliteData.current.map(sat => {
        const orbitProgress = ((now * sat.speed) % (90 * 60 * 1000)) / (90 * 60 * 1000)
        const angle = (orbitProgress * 360 + sat.phase) % 360
        const lat = sat.inclination * Math.sin((angle * Math.PI) / 180)
        const lon = (angle * 1.5 - 180) % 360 - 180

        return {
          id: sat.id,
          position: Cartesian3.fromDegrees(lon, lat, sat.altitude),
        }
      })
      setSatellites(newPositions)
    }

    updateSatellites()
    const interval = setInterval(updateSatellites, 500)
    return () => clearInterval(interval)
  }, [mounted, timeSpeed])

  // Data pulses from locations
  useEffect(() => {
    if (!mounted) return

    const createPulse = () => {
      const loc = LOCATIONS[Math.floor(Math.random() * (LOCATIONS.length - 1))]
      const id = Date.now()

      setDataPulses(prev => [...prev, { id, lat: loc.lat, lon: loc.lon, radius: 50000, opacity: 0.8 }])

      // Animate the pulse
      let radius = 50000
      let opacity = 0.8
      const pulseInterval = setInterval(() => {
        radius += 30000
        opacity -= 0.05
        if (opacity <= 0) {
          clearInterval(pulseInterval)
          setDataPulses(prev => prev.filter(p => p.id !== id))
        } else {
          setDataPulses(prev => prev.map(p => p.id === id ? { ...p, radius, opacity } : p))
        }
      }, 50)
    }

    const interval = setInterval(createPulse, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  // Shooting stars
  useEffect(() => {
    if (!mounted) return

    const createShootingStar = () => {
      const viewer = viewerRef.current?.cesiumElement
      if (!viewer?.camera?.positionCartographic) return

      const height = viewer.camera.positionCartographic.height
      if (height < 10000000) return

      const id = Date.now()
      const startLon = Math.random() * 360 - 180
      const startLat = Math.random() * 120 - 60
      const endLon = startLon + (Math.random() * 60 - 30)
      const endLat = startLat + (Math.random() * 30 - 15)

      const star = {
        id,
        start: Cartesian3.fromDegrees(startLon, startLat, 1200000),
        end: Cartesian3.fromDegrees(endLon, endLat, 200000),
      }

      setShootingStars(prev => [...prev, star])
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id))
      }, 1500)
    }

    const interval = setInterval(createShootingStar, 2500)
    return () => clearInterval(interval)
  }, [mounted])

  // Rare UFO easter egg
  useEffect(() => {
    if (!mounted || ufoShown.current) return

    const maybeShowUFO = () => {
      if (Math.random() > 0.98 && !ufoShown.current) {
        const path = UFO_PATHS[Math.floor(Math.random() * UFO_PATHS.length)]
        let progress = 0

        ufoShown.current = true
        setUfo({ position: Cartesian3.fromDegrees(path.startLon, path.startLat, 600000), visible: true })

        const moveUFO = setInterval(() => {
          progress += 0.02
          if (progress >= 1) {
            clearInterval(moveUFO)
            setUfo(null)
          } else {
            const lat = path.startLat + (path.endLat - path.startLat) * progress
            const lon = path.startLon + (path.endLon - path.startLon) * progress
            // Wobbly UFO movement
            const wobbleLat = lat + Math.sin(progress * 20) * 2
            const wobbleLon = lon + Math.cos(progress * 15) * 2
            setUfo({ position: Cartesian3.fromDegrees(wobbleLon, wobbleLat, 600000 + Math.sin(progress * 10) * 50000), visible: true })
          }
        }, 50)
      }
    }

    const interval = setInterval(maybeShowUFO, 10000)
    return () => clearInterval(interval)
  }, [mounted])

  // Comet (occasional)
  useEffect(() => {
    if (!mounted) return

    const createComet = () => {
      const viewer = viewerRef.current?.cesiumElement
      if (!viewer?.camera?.positionCartographic) return
      if (viewer.camera.positionCartographic.height < 15000000) return

      const startLon = Math.random() * 360 - 180
      const startLat = 70 + Math.random() * 20
      const endLon = startLon + 120
      const endLat = -60 - Math.random() * 20

      setComet({
        start: Cartesian3.fromDegrees(startLon, startLat, 2000000),
        end: Cartesian3.fromDegrees(endLon, endLat, 500000),
        visible: true,
      })

      setTimeout(() => setComet(null), 4000)
    }

    const interval = setInterval(createComet, 20000)
    return () => clearInterval(interval)
  }, [mounted])

  // Holographic scan line effect
  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setScanLine(prev => (prev + 2) % 100)
    }, 50)

    return () => clearInterval(interval)
  }, [mounted])

  // Rocket launch easter egg
  const launchRocket = useCallback((lat: number, lon: number) => {
    let altitude = 0
    setRocketLaunch({ position: Cartesian3.fromDegrees(lon, lat, altitude), altitude })

    const launch = setInterval(() => {
      altitude += 50000
      if (altitude > 2000000) {
        clearInterval(launch)
        setRocketLaunch(null)
        showToast("🚀 Rocket successfully deployed to orbit!")
      } else {
        setRocketLaunch({ position: Cartesian3.fromDegrees(lon, lat, altitude), altitude })
      }
    }, 50)
  }, [])

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  // Journey playback
  useEffect(() => {
    if (!isPlayingJourney) return

    const journeyLocations = LOCATIONS.filter(l => l.id !== "secret")
    const viewer = viewerRef.current?.cesiumElement

    if (!viewer || journeyIndex >= journeyLocations.length) {
      setIsPlayingJourney(false)
      setJourneyIndex(0)
      if (journeyIndex >= journeyLocations.length) {
        showToast("🎉 Journey complete! That's my story so far...")
      }
      return
    }

    const loc = journeyLocations[journeyIndex]
    setSelectedLocation(loc)

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(loc.lon, loc.lat, 2000000),
      duration: 2,
    })

    const timer = setTimeout(() => {
      setJourneyIndex(prev => prev + 1)
    }, 4000)

    return () => clearTimeout(timer)
  }, [isPlayingJourney, journeyIndex, showToast])

  const handlePlayJourney = () => {
    setJourneyIndex(0)
    setIsPlayingJourney(true)
    showToast("🚀 Starting the journey through time...")
  }

  const handleStopJourney = () => {
    setIsPlayingJourney(false)
    setJourneyIndex(0)
  }

  const handleResetView = () => {
    const viewer = viewerRef.current?.cesiumElement
    if (viewer) {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-98, 38, 12000000),
        duration: 1.5,
      })
    }
    setSelectedLocation(null)
  }

  const handleGlobeClick = () => {
    const now = Date.now()
    if (now - lastSpinTime.current < 500) {
      spinCount.current++
      if (spinCount.current >= 5) {
        showToast("Whoa, slow down! I've only worked in a few places so far. Give me time.")
        spinCount.current = 0
      }
    } else {
      spinCount.current = 1
    }
    lastSpinTime.current = now
  }

  const handleBackgroundClick = () => {
    if (selectedLocation) {
      setSelectedLocation(null)
    } else {
      showToast("Nothing here yet... but give me time. 🚀")
    }
  }

  // Zoom easter egg
  useEffect(() => {
    if (!mounted || zoomEasterEggShown.current) return

    const checkZoom = setInterval(() => {
      const viewer = viewerRef.current?.cesiumElement
      if (viewer?.camera?.positionCartographic) {
        const height = viewer.camera.positionCartographic.height
        if (height > 30000000 && !zoomEasterEggShown.current) {
          showToast("Looking at the big picture? I respect that mindset. 🌍")
          zoomEasterEggShown.current = true
          clearInterval(checkZoom)
        }
      }
    }, 1000)

    return () => clearInterval(checkZoom)
  }, [mounted, showToast])

  // Prevent scroll propagation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }

    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [mounted])

  const handleISSClick = () => {
    showToast("🛰️ That's the ISS! Orbiting at 28,000 km/h. I track things like this for a living.")
  }

  const handleUFOClick = () => {
    showToast("👽 You found the UFO! Don't tell anyone... they're not supposed to know I'm here.")
  }

  const handleSatelliteClick = () => {
    showToast("📡 Starlink satellite! Part of a constellation providing global internet coverage.")
  }

  const handleLocationDoubleClick = (loc: LocationPin) => {
    if (loc.id !== "secret") {
      launchRocket(loc.lat, loc.lon)
      showToast(`🚀 Launching rocket from ${loc.name}!`)
    }
  }

  if (!mounted) return <div className="w-full h-full bg-black/20 animate-pulse" />

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[600px] rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_60px_rgba(0,212,255,0.3)]",
        props.className
      )}
      onClick={handleGlobeClick}
      style={{ overscrollBehavior: "contain", cursor: "grab" }}
    >
      {/* Holographic scan line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20 opacity-10"
        style={{
          background: `linear-gradient(transparent ${scanLine}%, rgba(0,212,255,0.3) ${scanLine + 1}%, transparent ${scanLine + 2}%)`,
        }}
      />

      <Viewer
        ref={viewerRef as React.RefObject<never>}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        geocoder={false}
        sceneModePicker={false}
        selectionIndicator={false}
        infoBox={false}
        className="h-full w-full"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, cursor: "grab" }}
        onClick={handleBackgroundClick}
      >
        {/* Journey path */}
        {showJourneyPath && (
          <Entity>
            <PolylineGraphics
              positions={JOURNEY_PATH}
              width={4}
              material={new PolylineGlowMaterialProperty({
                glowPower: 0.4,
                color: Color.CYAN.withAlpha(0.7),
              })}
            />
          </Entity>
        )}

        {/* Data pulses from locations */}
        {dataPulses.map((pulse) => (
          <Entity key={pulse.id} position={Cartesian3.fromDegrees(pulse.lon, pulse.lat)}>
            <EllipseGraphics
              semiMinorAxis={pulse.radius}
              semiMajorAxis={pulse.radius}
              height={0}
              material={new ColorMaterialProperty(Color.CYAN.withAlpha(pulse.opacity * 0.3))}
              outline
              outlineColor={Color.CYAN.withAlpha(pulse.opacity)}
              outlineWidth={2}
            />
          </Entity>
        ))}

        {/* City lights */}
        {showCityLights && MAJOR_CITIES.map((city, i) => (
          <Entity key={`city-${i}`} position={Cartesian3.fromDegrees(city.lon, city.lat, 1000)}>
            <PointGraphics
              pixelSize={4}
              color={Color.YELLOW.withAlpha(0.6)}
              outlineColor={Color.ORANGE.withAlpha(0.3)}
              outlineWidth={3}
            />
          </Entity>
        ))}

        {/* Location pins */}
        {LOCATIONS.map((loc) => (
          <Entity
            key={loc.id}
            position={Cartesian3.fromDegrees(loc.lon, loc.lat)}
            name={loc.name}
            description={loc.body}
            onClick={() => {
              setSelectedLocation(loc)
              if (loc.id === "secret") {
                showToast("🥚 Easter egg found! You're persistent, I like that.")
              }
              const viewer = viewerRef.current?.cesiumElement
              if (viewer && loc.id !== "secret") {
                viewer.camera.flyTo({
                  destination: Cartesian3.fromDegrees(loc.lon, loc.lat, 3000000),
                  duration: 1.5,
                })
              }
            }}
            onDoubleClick={() => handleLocationDoubleClick(loc)}
          >
            <PointGraphics
              pixelSize={loc.id === "secret" ? 8 : 16}
              color={loc.color}
              outlineColor={Color.WHITE}
              outlineWidth={2}
            />
          </Entity>
        ))}

        {/* ISS */}
        {issPosition && (
          <Entity position={issPosition} name="ISS" onClick={handleISSClick}>
            <PointGraphics pixelSize={10} color={Color.WHITE} outlineColor={Color.CYAN} outlineWidth={3} />
          </Entity>
        )}

        {/* Satellite constellation */}
        {satellites.map((sat) => (
          <Entity key={sat.id} position={sat.position} onClick={handleSatelliteClick}>
            <PointGraphics pixelSize={4} color={Color.WHITE.withAlpha(0.7)} />
          </Entity>
        ))}

        {/* Shooting stars */}
        {shootingStars.map((star) => (
          <Entity key={star.id}>
            <PolylineGraphics
              positions={new CallbackProperty(() => [star.start, star.end], false) as unknown as Cartesian3[]}
              width={3}
              material={new PolylineGlowMaterialProperty({
                glowPower: 0.6,
                color: Color.WHITE,
              })}
            />
          </Entity>
        ))}

        {/* Comet */}
        {comet?.visible && (
          <Entity>
            <PolylineGraphics
              positions={[comet.start, comet.end]}
              width={5}
              material={new PolylineGlowMaterialProperty({
                glowPower: 0.8,
                color: Color.fromCssColorString("#88CCFF"),
              })}
            />
          </Entity>
        )}

        {/* UFO easter egg */}
        {ufo?.visible && (
          <Entity position={ufo.position} onClick={handleUFOClick}>
            <PointGraphics
              pixelSize={14}
              color={Color.fromCssColorString("#00FF00")}
              outlineColor={Color.WHITE}
              outlineWidth={2}
            />
          </Entity>
        )}

        {/* Rocket launch */}
        {rocketLaunch && (
          <Entity position={rocketLaunch.position}>
            <PointGraphics
              pixelSize={8}
              color={Color.ORANGE}
              outlineColor={Color.RED}
              outlineWidth={4}
            />
          </Entity>
        )}
      </Viewer>

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

      {/* Corner vignette effect */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)"
      }} />

      {/* Control buttons */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
        {!isPlayingJourney ? (
          <button
            onClick={handlePlayJourney}
            className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3" />
            Play Journey
          </button>
        ) : (
          <button
            onClick={handleStopJourney}
            className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <Pause className="w-3 h-3" />
            Stop
          </button>
        )}
        <button
          onClick={handleResetView}
          className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-cyan-500/30 text-gray-400 text-xs font-medium hover:text-cyan-400 hover:border-cyan-400 transition-all cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <button
          onClick={() => setShowJourneyPath(!showJourneyPath)}
          className={cn(
            "flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
            showJourneyPath
              ? "border-cyan-500/50 text-cyan-400"
              : "border-gray-500/30 text-gray-500 hover:text-gray-400"
          )}
          title="Toggle Path"
        >
          <Rocket className="w-3 h-3" />
        </button>
        <button
          onClick={() => setShowCityLights(!showCityLights)}
          className={cn(
            "flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
            showCityLights
              ? "border-yellow-500/50 text-yellow-400"
              : "border-gray-500/30 text-gray-500 hover:text-gray-400"
          )}
          title="Toggle City Lights"
        >
          <Zap className="w-3 h-3" />
        </button>
        <button
          onClick={() => setTimeSpeed(prev => prev === 1 ? 10 : prev === 10 ? 50 : 1)}
          className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-all cursor-pointer"
          title="Time Speed"
        >
          <Clock className="w-3 h-3" />
          {timeSpeed}x
        </button>
      </div>

      {/* Location info card - positioned above Cesium attribution */}
      <div className="absolute bottom-20 left-4 z-20 bg-black/85 backdrop-blur-md p-4 rounded-lg border border-cyan-500/30 max-w-xs shadow-xl cursor-default">
        {selectedLocation ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: selectedLocation.color.toCssColorString() }}
              />
              <span className="text-xs text-gray-400">{selectedLocation.label}</span>
              {selectedLocation.year && (
                <span className="text-xs text-cyan-400 ml-auto font-mono">{selectedLocation.year}</span>
              )}
            </div>
            <h3 className="text-cyan-400 font-bold text-lg">{selectedLocation.title}</h3>
            <p className="text-sm text-white mt-1">{selectedLocation.body}</p>
            {selectedLocation.subtext && (
              <p className="text-xs text-gray-400 mt-2 italic">{selectedLocation.subtext}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-xs text-cyan-400 hover:underline font-medium cursor-pointer"
              >
                Close
              </button>
              {selectedLocation.id !== "secret" && (
                <button
                  onClick={() => handleLocationDoubleClick(selectedLocation)}
                  className="text-xs text-orange-400 hover:underline font-medium cursor-pointer"
                >
                  🚀 Launch Rocket
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-cyan-400 font-bold text-lg">My Journey</h3>
            <p className="text-xs text-gray-300">Click a pin to explore my story</p>
            <p className="text-xs text-gray-500 mt-1">Double-click to launch a rocket! 🚀</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-20 bg-black/85 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 shadow-xl cursor-default">
        <p className="text-xs text-gray-400 mb-2 font-medium">Locations</p>
        <div className="space-y-1.5">
          {LOCATIONS.filter((l) => l.id !== "secret").map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                setSelectedLocation(loc)
                const viewer = viewerRef.current?.cesiumElement
                if (viewer) {
                  viewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(loc.lon, loc.lat, 3000000),
                    duration: 1.5,
                  })
                }
              }}
              className="flex items-center gap-2 text-xs text-white hover:text-cyan-400 transition-colors w-full text-left cursor-pointer"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: loc.color.toCssColorString() }}
              />
              <span className="flex-1">{loc.label}</span>
              {loc.year && <span className="text-gray-500 font-mono text-[10px]">{loc.year}</span>}
            </button>
          ))}
        </div>

        {/* Space objects */}
        <div className="mt-3 pt-2 border-t border-gray-700 space-y-1.5">
          <p className="text-xs text-gray-500 mb-1">Space Objects</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse flex-shrink-0" />
            <span>ISS (Live)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-white/70 flex-shrink-0" />
            <span>Satellites ({SATELLITE_COUNT})</span>
          </div>
          {showCityLights && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400/60 flex-shrink-0" />
              <span>City Lights</span>
            </div>
          )}
        </div>
      </div>

      {/* Journey progress */}
      {isPlayingJourney && (
        <div className="absolute bottom-4 right-4 z-20 bg-black/85 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30 cursor-default">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Journey:</span>
            <div className="flex gap-1">
              {LOCATIONS.filter(l => l.id !== "secret").map((loc, i) => (
                <div
                  key={loc.id}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    i < journeyIndex ? "bg-cyan-400" : i === journeyIndex ? "bg-cyan-400 animate-pulse scale-125" : "bg-gray-600"
                  )}
                  title={loc.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/95 backdrop-blur-md px-6 py-4 rounded-xl border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 animate-in fade-in zoom-in duration-200 cursor-default">
          <p className="text-sm text-white text-center">{toastMessage}</p>
        </div>
      )}

      {/* Rocket launch indicator */}
      {rocketLaunch && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-black/90 backdrop-blur-md px-4 py-2 rounded-lg border border-orange-500/50">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 animate-bounce">🚀</span>
            <span className="text-xs text-orange-400 font-mono">
              ALT: {Math.round(rocketLaunch.altitude / 1000)} km
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
