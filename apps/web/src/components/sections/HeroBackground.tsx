import { useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ThreeElements } from '@react-three/fiber'
import { Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Easter egg messages for clicking shapes
const shapeEasterEggs = [
  "I can TIG weld 🔥",
  "I can stick weld ⚡",
  "I can MIG weld 🛠️",
  "I solder my own PCBs 🔌",
  "I 3D print functional parts 🖨️",
  "I build VR games for fun 🥽"
]

type ShapeProps = ThreeElements['mesh'] & {
  color?: string
  mousePosition: { x: number; y: number }
  parallaxStrength?: number
  onShapeClick?: () => void
}

// Mouse tracker component inside Canvas
function MouseTracker({ onMouseMove }: { onMouseMove: (x: number, y: number) => void }) {
  const { size, viewport } = useThree()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert screen coordinates to normalized values (-1 to 1)
      const x = (e.clientX / size.width) * 2 - 1
      const y = -(e.clientY / size.height) * 2 + 1
      onMouseMove(x * viewport.width * 0.1, y * viewport.height * 0.1)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [size, viewport, onMouseMove])

  return null
}

function Shape({ position, color, mousePosition, parallaxStrength = 0.3, onShapeClick, ...props }: ShapeProps) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const basePosition = useRef(position as [number, number, number])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2
      ref.current.rotation.y += delta * 0.3

      // Smooth parallax movement
      const targetX = basePosition.current[0] + mousePosition.x * parallaxStrength
      const targetY = basePosition.current[1] + mousePosition.y * parallaxStrength
      ref.current.position.x += (targetX - ref.current.position.x) * 0.05
      ref.current.position.y += (targetY - ref.current.position.y) * 0.05
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh
        {...props}
        ref={ref}
        position={position}
        scale={hovered ? 1.2 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onShapeClick}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={hovered ? "#ee6e73" : color}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

type FloatingTorusProps = ThreeElements['mesh'] & {
  mousePosition: { x: number; y: number }
  parallaxStrength?: number
}

function FloatingTorus({ position, mousePosition, parallaxStrength = 0.2, ...props }: FloatingTorusProps) {
    const ref = useRef<THREE.Mesh>(null)
    const basePosition = useRef(position as [number, number, number])

    useFrame((_, delta) => {
      if (ref.current) {
        ref.current.rotation.x -= delta * 0.1
        ref.current.rotation.y -= delta * 0.1

        // Smooth parallax movement (opposite direction for depth effect)
        const targetX = basePosition.current[0] - mousePosition.x * parallaxStrength
        const targetY = basePosition.current[1] - mousePosition.y * parallaxStrength
        ref.current.position.x += (targetX - ref.current.position.x) * 0.05
        ref.current.position.y += (targetY - ref.current.position.y) * 0.05
      }
    })

    return (
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh {...props} ref={ref} position={position}>
          <torusGeometry args={[0.8, 0.2, 16, 32]} />
          <meshStandardMaterial color="#4676fa" roughness={0.1} metalness={0.6} transparent opacity={0.6} />
        </mesh>
      </Float>
    )
}

export function HeroBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const eggIndexRef = useRef(0)

  const handleShapeClick = useCallback(() => {
    setToastMessage(shapeEasterEggs[eggIndexRef.current])
    eggIndexRef.current = (eggIndexRef.current + 1) % shapeEasterEggs.length
    setTimeout(() => setToastMessage(null), 3000)
  }, [])

  return (
    <>
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-40">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <MouseTracker onMouseMove={(x, y) => setMousePosition({ x, y })} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={1} />

          <Shape position={[-4, 2, -2]} color="#89f7fe" mousePosition={mousePosition} parallaxStrength={0.4} onShapeClick={handleShapeClick} />
          <Shape position={[4, -2, -3]} color="#4676fa" mousePosition={mousePosition} parallaxStrength={0.3} onShapeClick={handleShapeClick} />
          <FloatingTorus position={[3, 2, -5]} mousePosition={mousePosition} parallaxStrength={0.2} />
          <FloatingTorus position={[-3, -3, -4]} mousePosition={mousePosition} parallaxStrength={0.25} />

          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Shape click easter egg toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md px-6 py-3 rounded-lg border border-primary/50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-foreground">{toastMessage}</p>
        </div>
      )}
    </>
  )
}
