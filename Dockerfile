FROM node:20-slim

# Install ADB (Still needed for the physical Car Thing)
RUN apt-get update && apt-get install -y adb git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Run the new headless build script created in the PR
RUN npm run build:headless

# The environment variable Copilot implemented
ENV DESKTHING_PORT=3001

# Expose both ports (Dashboard and WebSocket Bridge)
EXPOSE 3001
EXPOSE 8891

# Start the new standalone server
ENTRYPOINT ["node", "dist/server-only.js"]
