import Logger from '../../utils/logger'
import { storeProvider } from '../../stores/storeProvider'
import { LOGGING_LEVELS, APP_REQUESTS } from '@deskthing/types'
import { PlatformStoreEvent } from '@shared/stores/platformStore'

/**
 * Headless version of store initializer - no Electron UI dependencies
 */
export async function initializeStoresHeadless(): Promise<void> {
  const { default: cacheManager } = await import('./cacheManager')

  Logger.addListener(async (logData) => {
    // In headless mode, just log to console instead of sending to UI
    if (logData.level === 'error') {
      console.error(`[${logData.source}] ${logData.message}`)
    } else if (logData.level === 'warn') {
      console.warn(`[${logData.source}] ${logData.message}`)
    } else if (logData.level === 'debug' && process.env.NODE_ENV === 'development') {
      console.debug(`[${logData.source}] ${logData.message}`)
    } else {
      console.log(`[${logData.source}] ${logData.message}`)
    }
  })

  // Register stores for cache management
  const storeList = {
    appStore: await storeProvider.getStore('appStore', false),
    mappingStore: await storeProvider.getStore('mappingStore', false),
    musicStore: await storeProvider.getStore('musicStore', false),
    settingsStore: await storeProvider.getStore('settingsStore', false),
    taskStore: await storeProvider.getStore('taskStore', false),
    releaseStore: await storeProvider.getStore('releaseStore', false),
    AppDataStore: await storeProvider.getStore('appDataStore', false),
    updateStore: await storeProvider.getStore('updateStore', false),
    clientStore: await storeProvider.getStore('clientStore', false),
    profileStore: await storeProvider.getStore('profileStore', true),
    autoLaunchStore: await storeProvider.getStore('autoLaunchStore', true),
    serverTaskStore: await storeProvider.getStore('serverTaskStore', true),
    thingifyStore: await storeProvider.getStore('thingifyStore', false),
    flashStore: await storeProvider.getStore('flashStore', false),
    notificationStore: await storeProvider.getStore('notificationStore', false),
    statsCollector: await storeProvider.getStore('statsCollector', true)
  }

  const platformStore = await storeProvider.getStore('platformStore', false)

  Object.values(storeList).forEach((store) => cacheManager.registerStore(store))

  // Set up store listeners (headless versions without UI events)
  storeList.mappingStore.addListener('action', (action) => {
    Logger.debug(`Action event: ${JSON.stringify(action)}`)
  })
  storeList.mappingStore.addListener('key', (key) => {
    Logger.debug(`Key event: ${JSON.stringify(key)}`)
  })
  storeList.mappingStore.addListener('profile', (profile) => {
    Logger.debug(`Profile event: ${JSON.stringify(profile)}`)
  })

  storeList.AppDataStore.on('settings', (data) => {
    Logger.debug('[HEADLESS]: Updated app settings')
  })

  storeList.appStore.on('apps', ({ data }) => {
    Logger.debug('[HEADLESS]: Updated app data')
  })

  storeList.taskStore.on('taskList', (taskList) => {
    Logger.debug('[HEADLESS]: Task list updated')
  })

  storeList.taskStore.on('currentTask', (task) => {
    Logger.debug('[HEADLESS]: Current task updated')
  })

  storeList.taskStore.on('task', (task) => {
    Logger.debug('[HEADLESS]: Task updated')
  })

  storeList.releaseStore.on('app', (app) => {
    Logger.debug('[HEADLESS]: GitHub apps updated')
  })

  storeList.releaseStore.on('client', (clients) => {
    Logger.debug('[HEADLESS]: GitHub clients updated')
  })

  storeList.releaseStore.on('appRepos', (appRepos) => {
    Logger.debug(`[HEADLESS]: ${appRepos?.length} app repos updated`)
  })

  storeList.releaseStore.on('clientRepos', (clientRepos) => {
    Logger.debug(`[HEADLESS]: ${clientRepos?.length} client repos updated`)
  })

  storeList.settingsStore.addSettingsListener((newSettings) => {
    Logger.debug('[HEADLESS]: Settings updated')
  })

  // Handle app requests in headless mode
  storeList.appStore.onAppMessage(APP_REQUESTS.OPEN, (data) => {
    if (typeof data.payload == 'string') {
      Logger.info(`App ${data.source} requested to open URL: ${data.payload}`, {
        source: 'appCommunication',
        function: 'handleRequestOpen'
      })
      // In headless mode, just log the request - no UI to open links
    } else {
      Logger.warn('App sent invalid payload for openAuthWindow', {
        source: 'appCommunication',
        function: 'handleRequestOpen',
        domain: data.source
      })
    }
  })

  storeList.appStore.onAppMessage(APP_REQUESTS.LOG, (data) => {
    if (data.request && Object.values(LOGGING_LEVELS).includes(data.request)) {
      const message =
        typeof data.payload === 'string'
          ? data.payload
          : typeof data.payload === 'object'
            ? JSON.stringify(data.payload)
            : String(data.payload)

      Logger.log(data.request, message, { domain: data.source.toUpperCase() })
    }
  })

  storeList.appStore.onAppMessage(
    APP_REQUESTS.GET,
    (data) => {
      if (data.request != 'input') return
      Logger.warn(
        `[HEADLESS]: ${data.source} tried accessing "Input" data type which is not supported in headless mode`,
        {
          source: 'appCommunication',
          function: 'handleRequestGetInput',
          domain: data.source
        }
      )
      // In headless mode, cannot display user forms - this would require UI
    },
    { request: 'input' }
  )

  storeList.clientStore.on('client-updated', (client) => {
    Logger.debug('[HEADLESS]: Client manifest updated')
  })

  storeList.updateStore.on('update-status', (status) => {
    Logger.debug('[HEADLESS]: Update status changed')
  })

  storeList.updateStore.on('update-progress', (progress) => {
    Logger.debug('[HEADLESS]: Update progress')
  })

  storeList.thingifyStore.on('downloadProgress', (progress) => {
    Logger.debug('[HEADLESS]: Flash download progress')
  })

  storeList.thingifyStore.on('stagedFileChange', (fileName) => {
    Logger.debug(`[HEADLESS]: Flash staged file changed to ${fileName}`)
  })

  storeList.flashStore.on('flash-state', (progress) => {
    Logger.debug('[HEADLESS]: Flash state changed')
  })

  platformStore.on(PlatformStoreEvent.CLIENT_CONNECTED, (data) => {
    Logger.info(`Platform client connected: ${data.clientId}`)
  })

  platformStore.on(PlatformStoreEvent.CLIENT_DISCONNECTED, (data) => {
    Logger.info(`Platform client disconnected: ${data}`)
  })

  platformStore.on(PlatformStoreEvent.CLIENT_UPDATED, (data) => {
    Logger.debug(`Platform client updated: ${data.clientId}`)
  })

  platformStore.on(PlatformStoreEvent.CLIENT_LIST, (data) => {
    Logger.debug(`Platform client list: ${data.length} clients`)
  })

  storeList.notificationStore.on('notification', (data) => {
    Logger.info(`Notification: ${data.id}`)
  })

  storeList.notificationStore.on('notificationList', (data) => {
    Logger.debug(`Notification list: ${data.length} notifications`)
  })
}
