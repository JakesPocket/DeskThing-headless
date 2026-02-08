/**
 * Environment detection utilities for Docker and headless mode
 */
import { existsSync } from 'fs'

/**
 * Detects if the application is running in a Docker container or headless mode.
 * 
 * Detection methods:
 * - Checks for /.dockerenv file (standard Docker indicator)
 * - Checks DOCKER environment variable
 * - Checks if the process was started via server-only.js (headless mode)
 * 
 * @returns true if running in Docker or headless mode
 */
export function isDockerOrHeadless(): boolean {
  // Check for Docker environment variable
  if (process.env.DOCKER === 'true' || process.env.IS_DOCKER === 'true') {
    return true
  }

  // Check for .dockerenv file (standard Docker indicator)
  try {
    if (existsSync('/.dockerenv')) {
      return true
    }
  } catch {
    // Ignore errors
  }

  // Check if we're running the headless server (server-only.js)
  // This is more reliable than checking for Electron availability
  if (process.argv[1]?.includes('server-only.js')) {
    return true
  }

  // Check if Electron app is available (this is the fallback)
  // Using dynamic require to avoid import issues in headless builds
  try {
    const electron = require('electron')
    // If electron.app is available, we're in Electron mode
    if (electron.app) {
      return false
    }
  } catch {
    // Electron not available = headless mode
    return true
  }

  // Default to false (Electron mode) if we can't determine
  return false
}

/**
 * Gets a human-readable description of the current environment
 */
export function getEnvironmentType(): string {
  if (isDockerOrHeadless()) {
    return 'Docker/Headless'
  }
  return 'Electron'
}
