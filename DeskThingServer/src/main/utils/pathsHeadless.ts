import { join } from 'node:path'

/**
 * Path utility for headless mode (no Electron dependencies)
 * Provides similar functionality to Electron's app.getPath()
 */

let userDataPath: string | null = null

export function initUserDataPath(path?: string): void {
  if (path) {
    userDataPath = path
  } else {
    // Default to 'data' directory in current working directory
    userDataPath = join(process.cwd(), 'data')
  }
}

export function getUserDataPath(): string {
  if (!userDataPath) {
    initUserDataPath()
  }
  return userDataPath!
}

export function getResourcesPath(...pathSegments: string[]): string {
  // In development mode
  if (process.env.NODE_ENV === 'development') {
    return join(process.cwd(), 'resources', ...pathSegments)
  }

  // In production mode for headless server
  return join(process.cwd(), 'resources', ...pathSegments)
}

// Initialize with default path on module load
initUserDataPath()
