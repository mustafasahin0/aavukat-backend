#!/bin/bash

# This script installs dependencies before the application is deployed

cd /var/app/staging

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

echo "Installing Node.js dependencies with pnpm..."
pnpm install

echo "Generating Prisma client if needed..."
if [ -f "./node_modules/.bin/prisma" ]; then
  echo "Running Prisma generate..."
  ./node_modules/.bin/prisma generate
fi

echo "Building application if needed..."
pnpm run build || echo "Build script failed but continuing..."

echo "Dependencies installation complete!" 