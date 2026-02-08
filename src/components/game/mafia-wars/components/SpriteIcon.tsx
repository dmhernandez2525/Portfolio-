// ========================================
// MAFIA WARS - SPRITE ICON COMPONENT
// ========================================

import { cn } from '@/lib/utils'
import {
  SPRITES,
  WEAPON_POSITIONS,
  VEHICLE_POSITIONS,
  ARMOR_POSITIONS,
  PROPERTY_POSITIONS,
  CHARACTER_POSITIONS,
} from '../assets'

type SpriteType = 'weapon' | 'vehicle' | 'armor' | 'property' | 'character'

interface SpriteIconProps {
  type: SpriteType
  id: string
  size?: number
  className?: string
}

const SPRITE_CONFIG: Record<SpriteType, { 
  sprite: string
  positions: Record<string, { row: number; col: number }>
  cols: number
}> = {
  weapon: { sprite: SPRITES.weapons, positions: WEAPON_POSITIONS, cols: 4 },
  vehicle: { sprite: SPRITES.vehicles, positions: VEHICLE_POSITIONS, cols: 3 },
  armor: { sprite: SPRITES.armor, positions: ARMOR_POSITIONS, cols: 4 },
  property: { sprite: SPRITES.properties, positions: PROPERTY_POSITIONS, cols: 4 },
  character: { sprite: SPRITES.characters, positions: CHARACTER_POSITIONS, cols: 4 },
}

// Base size of each sprite in the sheet (approximate)
const BASE_SPRITE_SIZE: Record<SpriteType, number> = {
  weapon: 128,
  vehicle: 170,
  armor: 128,
  property: 128,
  character: 128,
}

export function SpriteIcon({ type, id, size = 48, className }: SpriteIconProps) {
  const config = SPRITE_CONFIG[type]
  const position = config.positions[id]
  
  if (!position) {
    // Fallback to emoji if sprite position not found
    return <span className={className}>❓</span>
  }

  const baseSize = BASE_SPRITE_SIZE[type]
  const scale = size / baseSize

  return (
    <div
      className={cn('overflow-hidden flex-shrink-0', className)}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${config.sprite})`,
        backgroundPosition: `-${position.col * baseSize}px -${position.row * baseSize}px`,
        backgroundSize: `${config.cols * baseSize}px auto`,
        backgroundRepeat: 'no-repeat',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    />
  )
}

// Simplified component for inline use
export function WeaponIcon({ id, size, className }: Omit<SpriteIconProps, 'type'>) {
  return <SpriteIcon type="weapon" id={id} size={size} className={className} />
}

export function VehicleIcon({ id, size, className }: Omit<SpriteIconProps, 'type'>) {
  return <SpriteIcon type="vehicle" id={id} size={size} className={className} />
}

export function ArmorIcon({ id, size, className }: Omit<SpriteIconProps, 'type'>) {
  return <SpriteIcon type="armor" id={id} size={size} className={className} />
}

export function PropertyIcon({ id, size, className }: Omit<SpriteIconProps, 'type'>) {
  return <SpriteIcon type="property" id={id} size={size} className={className} />
}

export function CharacterIcon({ id, size, className }: Omit<SpriteIconProps, 'type'>) {
  return <SpriteIcon type="character" id={id} size={size} className={className} />
}
