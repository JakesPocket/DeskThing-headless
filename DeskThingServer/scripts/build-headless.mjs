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
      // Return the file path as a default export
      const outputPath = args.path.replace(/\.ts$/, '.js');
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
    
    await build({
      entryPoints: [resolve(__dirname, '../src/main/server-only.ts')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: resolve(__dirname, '../dist/server-only.js'),
      external: [
        'electron',
        'sharp',
        'auto-launch',
        'flashthing',
        '@deskthing/types'
      ],
      alias: {
        '@shared': resolve(__dirname, '../src/shared'),
        '@server': resolve(__dirname, '../src/main'),
        '@processes': resolve(__dirname, '../src/main/processes')
      },
      plugins: [modulePathPlugin],
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
      }
    });
    
    console.log('✓ Headless server built successfully at dist/server-only.js');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildHeadlessServer();
