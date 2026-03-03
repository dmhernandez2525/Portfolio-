import type { InputState } from "./types"

export function createInputState(): InputState {
  return {
    fireLeft: false,
    fireRight: false,
    fireUp: false,
    waterLeft: false,
    waterRight: false,
    waterUp: false,
  }
}

export function handleKeyDown(input: InputState, key: string): void {
  switch (key) {
    case "ArrowLeft":
      input.fireLeft = true
      break
    case "ArrowRight":
      input.fireRight = true
      break
    case "ArrowUp":
      input.fireUp = true
      break
    case "a":
    case "A":
      input.waterLeft = true
      break
    case "d":
    case "D":
      input.waterRight = true
      break
    case "w":
    case "W":
      input.waterUp = true
      break
  }
}

export function handleKeyUp(input: InputState, key: string): void {
  switch (key) {
    case "ArrowLeft":
      input.fireLeft = false
      break
    case "ArrowRight":
      input.fireRight = false
      break
    case "ArrowUp":
      input.fireUp = false
      break
    case "a":
    case "A":
      input.waterLeft = false
      break
    case "d":
    case "D":
      input.waterRight = false
      break
    case "w":
    case "W":
      input.waterUp = false
      break
  }
}
