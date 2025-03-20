#!/bin/bash

# This script installs dependencies before the application is deployed

cd /var/app/staging

# Debug info
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

echo "PNPM version: $(pnpm --version)"

# Clean any existing node_modules to avoid conflicts
echo "Cleaning existing node_modules..."
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml

# Install dependencies with pnpm
echo "Installing Node.js dependencies with pnpm..."
pnpm install --no-frozen-lockfile

# Install critical dependencies explicitly if needed
if [ ! -d "node_modules/cors" ] || [ ! -d "node_modules/express" ]; then
  echo "Some critical dependencies were not installed. Installing them explicitly..."
  pnpm add cors express body-parser dotenv bcryptjs jsonwebtoken mongoose @prisma/client
fi

echo "Generating Prisma client if needed..."
if [ -f "./node_modules/.bin/prisma" ]; then
  echo "Running Prisma generate..."
  ./node_modules/.bin/prisma generate
fi

echo "Building application..."
pnpm run build

# Verify if dependencies were installed
echo "Verifying dependency installation..."
if [ -d "node_modules/cors" ]; then
  echo "CORS module found."
else
  echo "WARNING: CORS module not found!"
fi

echo "Dependencies installation complete!" 