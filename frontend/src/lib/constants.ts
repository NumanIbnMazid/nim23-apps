const isDev = process.env.NODE_ENV !== 'production' // Check if in development mode
const port = process.env.PORT || 3000 // Use the defined port, otherwise default to 3000

export const PUBLIC_SITE_URL = isDev
  ? `http://localhost:${port}` // Localhost with dynamic port
  : process.env.NEXT_PUBLIC_SITE_URL || 'https://apps.nim23.com'

export const STATIC_SITE_URL = isDev
  ? `http://localhost:${port}` // Localhost with dynamic port
  : process.env.NEXT_PUBLIC_SITE_URL || 'https://apps.nim23.com'

export const WEBSOCKET_URL = isDev
  ? `ws://localhost:8000` // Localhost with dynamic port
  : `wss://${process.env.BACKEND_DOMAIN}`
