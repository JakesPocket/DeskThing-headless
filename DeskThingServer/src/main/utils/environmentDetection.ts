/**
 * Environment detection utilities for Docker and headless mode
 */

/**
 * Detects if the application is running in a Docker container or headless mode.
 * 
 * Detection methods:
 * - Checks for /.dockerenv file (standard Docker indicator)
 * - Checks DOCKER environment variable
 * - Checks if Electron app is not available (headless Node.js mode)
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
    const fs = require('fs')
    if (fs.existsSync('/.dockerenv')) {
      return true
    }
  } catch {
    // Ignore errors
  }

  // Check if we're in headless mode (no Electron)
  try {
    require('electron')
    return false
  } catch {
    // Electron not available = headless mode
    return true
  }
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
