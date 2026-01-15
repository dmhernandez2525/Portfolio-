import { Ion } from "cesium"

// Set Cesium Ion access token from environment variable
// Get your token at: https://cesium.com/ion/tokens
const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN

if (CESIUM_ION_TOKEN) {
  Ion.defaultAccessToken = CESIUM_ION_TOKEN
} else {
  console.warn(
    "Cesium Ion token not configured. Set VITE_CESIUM_ION_TOKEN in your .env file. " +
    "Get a free token at https://cesium.com/ion/tokens"
  )
}

export { CESIUM_ION_TOKEN }
