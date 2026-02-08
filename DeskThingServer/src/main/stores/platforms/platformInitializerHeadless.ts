import Logger from '@server/utils/logger'
import { storeProvider } from '@server/stores/storeProvider'
import { WebSocketPlatformHeadless } from './websocket/wsPlatformHeadless'
import { ADBPlatformHeadless } from './superbird/adbPlatformHeadless'

/**
 * Headless version of platform initializer - no Electron dependencies
 */
export async function initializePlatformsHeadless(port: number = 8891): Promise<void> {
  try {
    const platformStore = await storeProvider.getStore('platformStore')

    // Initialize WebSocket platform for headless mode
    const wsPlatform = new WebSocketPlatformHeadless()
    const adbPlatform = new ADBPlatformHeadless()
    
    await platformStore.registerPlatform(wsPlatform)
    await platformStore.registerPlatform(adbPlatform)

    // Start the WebSocket platform on the specified port
    await platformStore.startPlatform(wsPlatform.id, {
      port: port,
      address: '0.0.0.0'
    })

    // Start the ADB platform
    await platformStore.startPlatform(adbPlatform.id, {
      autoDetect: true
    })

    Logger.debug(`Platforms initialized successfully (headless mode) on port ${port}`, {
      source: 'platformInitializerHeadless',
      function: 'initializePlatformsHeadless'
    })
  } catch (error) {
    Logger.error('Failed to initialize platforms (headless mode)', {
      source: 'platformInitializerHeadless',
      function: 'initializePlatformsHeadless',
      error: error instanceof Error ? error : new Error(String(error))
    })
  }
}
