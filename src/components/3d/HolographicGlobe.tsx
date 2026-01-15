import { Viewer, Entity, PointGraphics, PolylineGraphics } from "resium"
import { Cartesian3, Color, type Viewer as CesiumViewer, PolylineGlowMaterialProperty, CallbackProperty } from "cesium"
import "@/lib/cesium-config" // Initialize Cesium Ion token
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw, Rocket, Zap, Clock, ChevronLeft, ChevronRight } from "lucide-react"

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

// ISS orbital period in minutes
const ISS_ORBITAL_PERIOD = 92.68

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

// ISS_ORBITAL_PERIOD constant removed - ISS tracking disabled

export function HolographicGlobe(props: ComponentProps<"div">) {
  const [mounted, setMounted] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationPin | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isPlayingJourney, setIsPlayingJourney] = useState(false)
  const [journeyActive, setJourneyActive] = useState(false) // True when user is in journey mode (auto or manual)
  const [journeyIndex, setJourneyIndex] = useState(0)
  const [showJourneyPath, setShowJourneyPath] = useState(true)
  const [showSpaceObjects, setShowSpaceObjects] = useState(true) // Default ON - shows ISS & satellites
  const [shootingStars, setShootingStars] = useState<Array<{ id: number; start: Cartesian3; end: Cartesian3 }>>([])
  const [showCityLights, setShowCityLights] = useState(true)
  const [ufo, setUfo] = useState<{ position: Cartesian3; visible: boolean } | null>(null)
  const [rocketLaunch, setRocketLaunch] = useState<{ position: Cartesian3; altitude: number } | null>(null)
  const [timeSpeed, setTimeSpeed] = useState(50)
  // Scan line moved to CSS animation to prevent re-renders
  const [comet, setComet] = useState<{ start: Cartesian3; end: Cartesian3; visible: boolean } | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)

  const viewerRef = useRef<{ cesiumElement?: CesiumViewer } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastSpinTime = useRef<number>(0)
  const spinCount = useRef<number>(0)
  const initialFlyDone = useRef(false)
  const zoomEasterEggShown = useRef(false)
  const satelliteData = useRef(generateSatellites())
  const ufoShown = useRef(false)
  const timeSpeedRef = useRef(timeSpeed)

  // Keep timeSpeedRef in sync with state
  useEffect(() => {
    timeSpeedRef.current = timeSpeed
  }, [timeSpeed])

  // Create CallbackProperty for ISS position (smooth animation without React re-renders)
  const issPositionCallback = useMemo(() => new CallbackProperty(() => {
    const now = Date.now() * timeSpeedRef.current
    const orbitProgress = (now % (ISS_ORBITAL_PERIOD * 60 * 1000)) / (ISS_ORBITAL_PERIOD * 60 * 1000)
    const angle = orbitProgress * 360
    const inclination = 51.6
    const lat = inclination * Math.sin((angle * Math.PI) / 180)
    const lon = (angle * 2 - 180) % 360 - 180
    return Cartesian3.fromDegrees(lon, lat, 408000)
  }, false), [])

  // Create CallbackProperty for each satellite (smooth animation without React re-renders)
  const satellitePositionCallbacks = useMemo(() => {
    return satelliteData.current.map(sat => ({
      id: sat.id,
      positionCallback: new CallbackProperty(() => {
        const now = Date.now() * timeSpeedRef.current
        const orbitProgress = ((now * sat.speed) % (90 * 60 * 1000)) / (90 * 60 * 1000)
        const angle = (orbitProgress * 360 + sat.phase) % 360
        const lat = sat.inclination * Math.sin((angle * Math.PI) / 180)
        const lon = (angle * 1.5 - 180) % 360 - 180
        return Cartesian3.fromDegrees(lon, lat, sat.altitude)
      }, false)
    }))
  }, [])

  // Memoize materials to prevent flickering from recreation on every render
  const journeyPathMaterial = useMemo(() => new PolylineGlowMaterialProperty({
    glowPower: 0.4,
    color: Color.CYAN.withAlpha(0.7),
  }), [])

  const shootingStarMaterial = useMemo(() => new PolylineGlowMaterialProperty({
    glowPower: 0.6,
    color: Color.WHITE,
  }), [])

  const cometMaterial = useMemo(() => new PolylineGlowMaterialProperty({
    glowPower: 0.8,
    color: Color.fromCssColorString("#88CCFF"),
  }), [])

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

  // ISS and Satellites now use CallbackProperty for smooth animation (see useMemo above)
  // This prevents React re-renders from causing Cesium entities to flicker

  // Data pulses from locations - disabled to prevent flickering
  // The frequent state updates were causing Cesium to re-render entities
  useEffect(() => {
    if (!mounted) return
    // Pulses disabled - they caused too many re-renders
    // If needed, implement with Cesium's native animation instead of React state
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

    const interval = setInterval(createShootingStar, 8000) // Reduced frequency to prevent flickering
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

  // Holographic scan line effect - moved to CSS animation to prevent re-renders

  // Rocket launch easter egg - with dramatic camera follow
  const launchRocket = useCallback((lat: number, lon: number) => {
    const viewer = viewerRef.current?.cesiumElement
    if (!viewer) return

    let altitude = 0
    setRocketLaunch({ position: Cartesian3.fromDegrees(lon, lat, altitude), altitude })

    // Save current camera position to return to
    const originalPosition = viewer.camera.position.clone()
    const originalHeading = viewer.camera.heading
    const originalPitch = viewer.camera.pitch

    // Initial close-up view of launch site
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat - 0.5, 50000),
      orientation: {
        heading: 0,
        pitch: -0.3, // Slight downward angle
        roll: 0
      },
      duration: 1
    })

    // Start launch after camera positions
    setTimeout(() => {
      const launch = setInterval(() => {
        altitude += 25000 // Slower ascent for better visualization

        if (altitude > 2500000) {
          clearInterval(launch)
          setRocketLaunch(null)

          // Show success toast
          showToast("🚀 Rocket successfully deployed to orbit!")

          // Dramatic pause at orbit, then return to original view
          setTimeout(() => {
            viewer.camera.flyTo({
              destination: originalPosition,
              orientation: {
                heading: originalHeading,
                pitch: originalPitch,
                roll: 0
              },
              duration: 2
            })
          }, 1500)
        } else {
          setRocketLaunch({ position: Cartesian3.fromDegrees(lon, lat, altitude), altitude })

          // Camera follows rocket up with gradual pull-back
          const cameraAltitude = altitude + 100000 + (altitude * 0.5) // Pull back as rocket goes higher
          const cameraTilt = Math.min(-0.2, -0.5 + (altitude / 5000000)) // Gradually level out

          viewer.camera.setView({
            destination: Cartesian3.fromDegrees(lon, lat - 0.3, cameraAltitude),
            orientation: {
              heading: 0,
              pitch: cameraTilt,
              roll: 0
            }
          })
        }
      }, 80) // Slower interval for smoother animation
    }, 1200)
  }, [])

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  // Journey playback - slower pace for better viewing
  useEffect(() => {
    if (!isPlayingJourney) return

    const journeyLocations = LOCATIONS.filter(l => l.id !== "secret")
    const viewer = viewerRef.current?.cesiumElement

    if (!viewer || journeyIndex >= journeyLocations.length) {
      setIsPlayingJourney(false)
      if (journeyIndex >= journeyLocations.length) {
        showToast("🎉 Journey complete! That's my story so far...")
        setJourneyIndex(0)
      }
      return
    }

    const loc = journeyLocations[journeyIndex]
    setSelectedLocation(loc)

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(loc.lon, loc.lat, 2000000),
      duration: 2.5,
    })

    const timer = setTimeout(() => {
      setJourneyIndex(prev => prev + 1)
    }, 10000) // 10 seconds per location for better reading time

    return () => clearTimeout(timer)
  }, [isPlayingJourney, journeyIndex, showToast])

  // Manual journey navigation
  const handleJourneyPrev = useCallback(() => {
    const journeyLocations = LOCATIONS.filter(l => l.id !== "secret")
    const newIndex = Math.max(0, journeyIndex - 1)
    setJourneyIndex(newIndex)

    const loc = journeyLocations[newIndex]
    setSelectedLocation(loc)

    const viewer = viewerRef.current?.cesiumElement
    if (viewer) {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(loc.lon, loc.lat, 2000000),
        duration: 1.5,
      })
    }
  }, [journeyIndex])

  const handleJourneyNext = useCallback(() => {
    const journeyLocations = LOCATIONS.filter(l => l.id !== "secret")
    if (journeyIndex >= journeyLocations.length - 1) {
      showToast("🎉 Journey complete! That's my story so far...")
      setIsPlayingJourney(false)
      setJourneyActive(false)
      setJourneyIndex(0)
      return
    }

    const newIndex = journeyIndex + 1
    setJourneyIndex(newIndex)

    const loc = journeyLocations[newIndex]
    setSelectedLocation(loc)

    const viewer = viewerRef.current?.cesiumElement
    if (viewer) {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(loc.lon, loc.lat, 2000000),
        duration: 1.5,
      })
    }
  }, [journeyIndex, showToast])

  const handlePlayJourney = () => {
    setJourneyIndex(0)
    setJourneyActive(true)
    setIsPlayingJourney(true)
    showToast("🚀 Starting the journey through time...")
  }

  const handleStopJourney = () => {
    setIsPlayingJourney(false)
    setJourneyActive(false)
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

  // Prevent scroll propagation - ONLY when interacting with globe
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Only capture scroll events if user has clicked to interact
      if (isInteracting) {
        e.stopPropagation()
        e.preventDefault() // Prevent page scroll when interacting
      }
    }

    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [mounted, isInteracting])

  // Disable Cesium scene input until user clicks
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement
    if (!viewer?.scene?.screenSpaceCameraController) return

    const controller = viewer.scene.screenSpaceCameraController

    // Enable/disable all camera controls based on interaction state
    controller.enableRotate = isInteracting
    controller.enableZoom = isInteracting
    controller.enableTilt = isInteracting
    controller.enableLook = isInteracting
    controller.enableTranslate = isInteracting
  }, [isInteracting])

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
      onClick={() => {
        if (!isInteracting) {
          setIsInteracting(true)
        }
        handleGlobeClick()
      }}
      onMouseLeave={() => setIsInteracting(false)}
      style={{ overscrollBehavior: "contain", cursor: isInteracting ? "grab" : "pointer" }}
    >
      {/* Click to interact overlay */}
      {!isInteracting && (
        <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center cursor-pointer">
          <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-cyan-500/50 shadow-xl animate-pulse">
            <p className="text-cyan-400 font-medium text-center">
              <span className="text-2xl block mb-1">🖱️</span>
              Click to interact with globe
            </p>
            <p className="text-gray-400 text-xs text-center mt-1">Scroll & drag to explore</p>
          </div>
        </div>
      )}

      {/* Holographic scan line overlay - CSS animation to prevent re-renders */}
      <div
        className="absolute inset-0 pointer-events-none z-20 opacity-10 animate-scan-line"
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
        {/* Journey path - uses memoized material */}
        {showJourneyPath && (
          <Entity>
            <PolylineGraphics
              positions={JOURNEY_PATH}
              width={4}
              material={journeyPathMaterial}
            />
          </Entity>
        )}

        {/* Data pulses disabled to prevent flickering */}

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

        {/* ISS - only when space objects enabled, uses CallbackProperty for smooth orbit */}
        {showSpaceObjects && (
          <Entity position={issPositionCallback as unknown as Cartesian3} name="ISS" onClick={handleISSClick}>
            <PointGraphics pixelSize={10} color={Color.WHITE} outlineColor={Color.CYAN} outlineWidth={3} />
          </Entity>
        )}

        {/* Satellite constellation - only when space objects enabled, uses CallbackProperty */}
        {showSpaceObjects && satellitePositionCallbacks.map((sat) => (
          <Entity key={sat.id} position={sat.positionCallback as unknown as Cartesian3} onClick={handleSatelliteClick}>
            <PointGraphics pixelSize={4} color={Color.WHITE.withAlpha(0.7)} />
          </Entity>
        ))}

        {/* Shooting stars - uses memoized material */}
        {shootingStars.map((star) => (
          <Entity key={star.id}>
            <PolylineGraphics
              positions={[star.start, star.end]}
              width={3}
              material={shootingStarMaterial}
            />
          </Entity>
        ))}

        {/* Comet - uses memoized material */}
        {comet?.visible && (
          <Entity>
            <PolylineGraphics
              positions={[comet.start, comet.end]}
              width={5}
              material={cometMaterial}
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
          onClick={() => setShowSpaceObjects(!showSpaceObjects)}
          className={cn(
            "flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
            showSpaceObjects
              ? "border-white/50 text-white"
              : "border-gray-500/30 text-gray-500 hover:text-gray-400"
          )}
          title="Toggle Space Objects (ISS & Satellites)"
        >
          <span className="text-sm">🛰️</span>
        </button>
        <button
          onClick={() => {
            const speeds = [1, 10, 50, 100, 200, 500, 1000]
            const currentIndex = speeds.indexOf(timeSpeed)
            setTimeSpeed(speeds[(currentIndex + 1) % speeds.length])
          }}
          className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg border border-purple-500/30 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-all cursor-pointer"
          title="Time Speed (click to cycle: 1x, 10x, 50x, 100x, 200x, 500x, 1000x)"
        >
          <Clock className="w-3 h-3" />
          {timeSpeed}x
        </button>
      </div>

      {/* Location info card - positioned above Cesium attribution, hidden on mobile when journey active */}
      <div className={cn(
        "absolute z-20 bg-black/85 backdrop-blur-md p-3 md:p-4 rounded-lg border border-cyan-500/30 shadow-xl cursor-default",
        "bottom-4 left-4 right-4 md:right-auto md:bottom-20 md:max-w-xs",
        journeyActive && "hidden md:block" // Hide on mobile when journey is active to prevent overlap
      )}>
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

      {/* Legend - hidden on mobile for cleaner view */}
      <div className="absolute top-4 right-4 z-20 bg-black/85 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 shadow-xl cursor-default hidden md:block">
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

        {/* Visual effects legend */}
        <div className="mt-3 pt-2 border-t border-gray-700 space-y-2">
          {showCityLights && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400/60 flex-shrink-0" />
              <span>City Lights</span>
            </div>
          )}
          {showSpaceObjects && (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse flex-shrink-0" />
                <span>ISS (Simulated)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-white/70 flex-shrink-0" />
                <span>Satellites ({SATELLITE_COUNT})</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Journey progress with controls - centered at bottom */}
      {journeyActive && (
        <div className="absolute bottom-4 md:bottom-8 left-2 right-2 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 bg-black/95 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 rounded-xl border-2 border-cyan-500/50 shadow-xl cursor-default">
          <div className="flex flex-col items-center gap-3">
            {/* Title and current location */}
            <div className="text-center">
              <span className="text-sm font-bold text-cyan-400">My Journey</span>
              <p className="text-xs text-gray-400 mt-0.5">
                {LOCATIONS.filter(l => l.id !== "secret")[journeyIndex]?.name || ""}
              </p>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => { setIsPlayingJourney(false); handleJourneyPrev() }}
                  className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors cursor-pointer border border-cyan-500/30"
                  title="Previous Location"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-[10px] text-gray-500 mt-1">Prev</span>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5">
                {LOCATIONS.filter(l => l.id !== "secret").map((loc, i) => (
                  <div
                    key={loc.id}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all cursor-pointer",
                      i < journeyIndex ? "bg-cyan-400" : i === journeyIndex ? "bg-cyan-400 animate-pulse scale-125 ring-2 ring-cyan-400/50" : "bg-gray-600 hover:bg-gray-500"
                    )}
                    title={loc.name}
                    onClick={() => {
                      setIsPlayingJourney(false)
                      setJourneyIndex(i)
                      setSelectedLocation(loc)
                      const viewer = viewerRef.current?.cesiumElement
                      if (viewer) {
                        viewer.camera.flyTo({
                          destination: Cartesian3.fromDegrees(loc.lon, loc.lat, 2000000),
                          duration: 1.5,
                        })
                      }
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-col items-center">
                <button
                  onClick={() => { setIsPlayingJourney(false); handleJourneyNext() }}
                  className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 transition-colors cursor-pointer border border-cyan-500/30"
                  title="Next Location"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-[10px] text-gray-500 mt-1">Next</span>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <button
                onClick={() => setIsPlayingJourney(!isPlayingJourney)}
                className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"
              >
                {isPlayingJourney ? <Pause className="w-3 h-3 inline mr-1" /> : <Play className="w-3 h-3 inline mr-1" />}
                {isPlayingJourney ? "Pause" : "Auto"}
              </button>
              <button
                onClick={handleStopJourney}
                className="px-3 py-1.5 rounded bg-red-900/50 hover:bg-red-800/50 text-red-400 cursor-pointer"
              >
                Exit
              </button>
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
