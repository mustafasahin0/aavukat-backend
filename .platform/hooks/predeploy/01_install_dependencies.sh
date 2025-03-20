#!/bin/bash

# This script installs dependencies before the application is deployed

cd /var/app/staging

# Debug info
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean any existing node_modules to avoid conflicts
echo "Cleaning existing node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Install dependencies directly with npm (more reliable)
echo "Installing Node.js dependencies with npm..."
npm install --legacy-peer-deps

# Install critical dependencies explicitly
echo "Installing critical dependencies explicitly..."
npm install cors express body-parser dotenv bcryptjs jsonwebtoken mongoose @prisma/client --save

echo "Generating Prisma client if needed..."
if [ -f "./node_modules/.bin/prisma" ]; then
  echo "Running Prisma generate..."
  ./node_modules/.bin/prisma generate
fi

echo "Building application if needed..."
npm run build || echo "Build script failed but continuing..."

# Verify if dependencies were installed
echo "Verifying dependency installation..."
if [ -d "node_modules/cors" ]; then
  echo "CORS module found."
else
  echo "WARNING: CORS module not found!"
fi

echo "Dependencies installation complete!" 