#!/usr/bin/env node

/**
 * Build script for the headless server-only entry point
 * Uses esbuild to compile the TypeScript code without Electron dependencies
 */

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Plugin to handle ?modulePath query parameter
const modulePathPlugin = {
  name: 'modulePath',
  setup(build) {
    build.onResolve({ filter: /\?modulePath$/ }, (args) => {
      const path = args.path.replace(/\?modulePath$/, '');
      return {
        path,
        namespace: 'modulePath'
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'modulePath' }, (args) => {
      // Get the filename from the path
      const filename = args.path.split('/').pop();
      // Ensure it has .js extension
      const filenameWithExt = filename.endsWith('.js') ? filename : `${filename}.js`;
      // Return the path relative to where server-only.js will run with .js extension
      const outputPath = `./${filenameWithExt}`;
      return {
        contents: `export default ${JSON.stringify(outputPath)};`,
        loader: 'js'
      };
    });
  }
};

async function buildHeadlessServer() {
  try {
    console.log('Building headless server...');
    
    // Build the main server
    await build({
      entryPoints: [resolve(__dirname, '../src/main/server-only.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: resolve(__dirname, '../dist/server-only.js'),
      external: [
        'sharp',
        'auto-launch',
        'flashthing',
        '@deskthing/types',
        'electron-updater'
      ],
      alias: {
        '@shared': resolve(__dirname, '../src/shared'),
        '@server': resolve(__dirname, '../src/main'),
        '@processes': resolve(__dirname, '../src/main/processes'),
        'electron': resolve(__dirname, '../src/main/utils/electronShim.ts'),
        'electron/main': resolve(__dirname, '../src/main/utils/electronShim.ts')
      },
      plugins: [modulePathPlugin],
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
      }
    });
    
    // Build the WebSocket worker as a separate bundle
    await build({
      entryPoints: [resolve(__dirname, '../src/main/stores/platforms/websocket/wsWebsocket.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: resolve(__dirname, '../dist/wsWebsocket.js'),
      external: [
        'sharp',
        '@deskthing/types'
      ],
      alias: {
        '@shared': resolve(__dirname, '../src/shared'),
        '@server': resolve(__dirname, '../src/main'),
        '@processes': resolve(__dirname, '../src/main/processes')
      },
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
      }
    });
    
    // Build the app process worker as a separate bundle
    await build({
      entryPoints: [resolve(__dirname, '../src/main/processes/appProcess.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: resolve(__dirname, '../dist/appProcess.js'),
      external: [
        'sharp',
        '@deskthing/types'
      ],
      alias: {
        '@shared': resolve(__dirname, '../src/shared'),
        '@server': resolve(__dirname, '../src/main'),
        '@processes': resolve(__dirname, '../src/main/processes')
      },
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
      }
    });
    
    // Build the flash process worker as a separate bundle
    await build({
      entryPoints: [resolve(__dirname, '../src/main/processes/flashProcess.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: resolve(__dirname, '../dist/flashProcess.js'),
      external: [
        'sharp',
        'flashthing',
        '@deskthing/types'
      ],
      alias: {
        '@shared': resolve(__dirname, '../src/shared'),
        '@server': resolve(__dirname, '../src/main'),
        '@processes': resolve(__dirname, '../src/main/processes')
      },
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
      }
    });
    
    console.log('✓ Headless server built successfully at dist/server-only.js');
    console.log('✓ WebSocket worker built successfully at dist/wsWebsocket.js');
    console.log('✓ App process worker built successfully at dist/appProcess.js');
    console.log('✓ Flash process worker built successfully at dist/flashProcess.js');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildHeadlessServer();
