# DeskThing Headless Server

This is a headless (no UI) version of the DeskThing server that runs the backend functionality without Electron.

## Features

- Express web dashboard served on port 8891
- WebSocket server for hardware bridge communication on port 8891
- ADB bridge for Superbird devices
- All backend store functionality
- No Electron UI dependencies

## Building

To build the headless server:

```bash
npm run build:headless
```

This will create a bundled JavaScript file at `dist/server-only.js`.

## Running

To run the headless server:

```bash
npm run start:headless
```

Or directly:

```bash
node dist/server-only.js
```

## Data Directory

By default, the server stores data in the `./data` directory relative to the current working directory. This includes:
- Apps
- Settings
- Client configurations
- Logs

## Environment Variables

The server supports the following environment variables:

- `NODE_ENV` - Set to `development` or `production`
- Standard Node.js environment variables

## Server Endpoints

Once running, the server provides:

- Web Dashboard: `http://localhost:8891/`
- WebSocket: `ws://localhost:8891/`
- Client Interface: `http://localhost:8891/client/`

## Differences from Full Application

The headless server:
- Does not display any windows or system tray
- Logs to console instead of sending to UI
- Cannot open external links in a browser window (logs them instead)
- Does not support user input forms (these are logged as unavailable)
- Does not support system notifications (logs them instead)

## Graceful Shutdown

The server handles `SIGINT` and `SIGTERM` signals gracefully, saving all cache before exiting.

Press `Ctrl+C` to stop the server.

## Troubleshooting

### Port Already in Use

If port 8891 is already in use, you'll see an error message. Stop the conflicting service or modify the port in the platform initializer.

### Missing Dependencies

If you see errors about missing dependencies, ensure you've run:

```bash
npm install
```

### Data Directory Issues

If you encounter permission errors, ensure the current user has read/write access to the `./data` directory.
