/**
 * Headless server entry point - no Electron UI dependencies.
 * Starts the Express server and WebSocket handler for backend functionality only.
 *
 * Features:
 * - Express web dashboard on port 8891
 * - WebSocket server for hardware bridge communication
 * - ADB bridge for Superbird devices
 * - Module loading and initialization
 */

import { join } from 'node:path'
import { existsSync } from 'node:fs'
import dotenv from 'dotenv'

// Initialize environment variables for Node.js (no Electron)
if (process.env.NODE_ENV === 'development') {
  dotenv.config()
} else {
  const envPath = join(process.cwd(), '.env.production')
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }
}

// Set up user data path for Node.js environment
const userDataPath = join(process.cwd(), 'data')

// Configuration - can be overridden with environment variables
const SERVER_PORT = parseInt(process.env.DESKTHING_PORT || '8891', 10)

// Initialize modules
async function startServer(): Promise<void> {
  try {
    console.log('Starting DeskThing headless server...')
    console.log(`User data path: ${userDataPath}`)
    console.log(`Server port: ${SERVER_PORT}`)

    // Initialize user data path
    const { initUserDataPath } = await import('./utils/pathsHeadless')
    initUserDataPath(userDataPath)

    // Initialize stores
    console.log('Initializing stores...')
    const { initializeStoresHeadless } = await import('./services/utility/storeInitializerHeadless')
    await initializeStoresHeadless()

    // Initialize platforms (WebSocket and ADB)
    console.log('Initializing platforms...')
    const { initializePlatformsHeadless } = await import('./stores/platforms/platformInitializerHeadless')
    await initializePlatformsHeadless(SERVER_PORT)

    console.log('Server started successfully!')
    console.log(`Web dashboard available at: http://localhost:${SERVER_PORT}/`)
    console.log(`Client interface available at: http://localhost:${SERVER_PORT}/client/`)
    console.log(`WebSocket hardware bridge running on port ${SERVER_PORT}`)
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...')
  try {
    const { storeProvider } = await import('./stores/storeProvider')
    const statsCollector = await storeProvider.getStore('statsCollector')
    await statsCollector.collectSessionCloseStats()

    const { default: cacheManager } = await import('./services/utility/cacheManager')
    await cacheManager.hibernateAll()
  } catch (error) {
    console.error('Error during shutdown:', error)
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\nShutting down server...')
  try {
    const { storeProvider } = await import('./stores/storeProvider')
    const statsCollector = await storeProvider.getStore('statsCollector')
    await statsCollector.collectSessionCloseStats()

    const { default: cacheManager } = await import('./services/utility/cacheManager')
    await cacheManager.hibernateAll()
  } catch (error) {
    console.error('Error during shutdown:', error)
  }
  process.exit(0)
})

// Start the server
startServer()
