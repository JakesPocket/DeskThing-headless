FROM node:20-slim

# Install ADB (needed for physical CarThing)
RUN apt-get update && apt-get install -y adb git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the DeskThingServer directory
COPY DeskThingServer/package*.json ./
RUN npm install

# Copy the rest of the DeskThingServer source
COPY DeskThingServer/ ./

# Build the headless server
RUN npm run build:headless

# Environment variable for port configuration
ENV DESKTHING_PORT=8891

# Expose the server port
EXPOSE 8891

# Start the headless server
CMD ["node", "dist/server-only.js"]
