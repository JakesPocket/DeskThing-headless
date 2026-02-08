/**
 * Electron shim for headless mode
 * Provides minimal Electron API compatibility for stores that use Electron
 */

import { join } from 'node:path'
import { getUserDataPath } from './pathsHeadless'

// Mock app object with minimal functionality
export const app = {
  getPath(name: string): string {
    switch (name) {
      case 'userData':
        return getUserDataPath()
      case 'exe':
        return process.execPath
      case 'home':
        return process.env.HOME || process.env.USERPROFILE || process.cwd()
      case 'temp':
        return process.env.TMPDIR || process.env.TEMP || '/tmp'
      default:
        console.warn(`app.getPath('${name}') not fully implemented in headless mode`)
        return join(getUserDataPath(), name)
    }
  },
  
  getVersion(): string {
    return '0.0.0-headless'
  },

  getName(): string {
    return 'DeskThing-Headless'
  },

  // Mock other app methods that might be used
  isReady(): boolean {
    return true
  },

  whenReady(): Promise<void> {
    return Promise.resolve()
  },

  getAppPath(): string {
    return process.cwd()
  },

  quit(): void {
    process.exit(0)
  },

  exit(code?: number): void {
    process.exit(code)
  }
}

// Mock BrowserWindow (not functional, just prevents errors)
export class BrowserWindow {
  constructor() {
    console.warn('BrowserWindow created in headless mode - no UI will be shown')
  }

  static getAllWindows() {
    return []
  }

  isDestroyed() {
    return true
  }

  close() {
    // No-op
  }

  focus() {
    // No-op
  }

  show() {
    // No-op
  }

  hide() {
    // No-op
  }

  webContents = {
    send: () => {},
    executeJavaScript: () => Promise.resolve(),
    session: {
      webRequest: {
        onHeadersReceived: () => {}
      }
    }
  }
}

// Mock ipcMain
export const ipcMain = {
  on: () => {},
  once: () => {},
  removeListener: () => {},
  handle: () => {},
  handleOnce: () => {},
  removeHandler: () => {}
}

// Mock shell
export const shell = {
  openExternal: (url: string) => {
    console.log(`[HEADLESS] Would open external URL: ${url}`)
    return Promise.resolve()
  },
  openPath: (path: string) => {
    console.log(`[HEADLESS] Would open path: ${path}`)
    return Promise.resolve('')
  }
}

// Mock nativeImage
export const nativeImage = {
  createFromPath: () => ({}),
  createEmpty: () => ({})
}

// Mock Tray
export class Tray {
  constructor() {
    console.log('[HEADLESS] Tray created (no system tray in headless mode)')
  }
  
  setToolTip() {}
  setContextMenu() {}
  on() {}
}

// Mock Menu
export const Menu = {
  buildFromTemplate: () => ({}),
  setApplicationMenu: () => {}
}

// Mock Notification
export class Notification {
  constructor(options: any) {
    console.log(`[HEADLESS] Notification: ${options.title}`)
  }
  
  show() {}
}

// Export default object for compatibility
export default {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  nativeImage,
  Tray,
  Menu,
  Notification
}
