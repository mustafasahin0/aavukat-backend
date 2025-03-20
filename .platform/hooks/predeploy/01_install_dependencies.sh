#!/bin/bash

# This script installs dependencies before the application is deployed

cd /var/app/staging

echo "Installing Node.js dependencies..."
npm ci || npm install

echo "Generating Prisma client if needed..."
if [ -f "./node_modules/.bin/prisma" ]; then
  echo "Running Prisma generate..."
  ./node_modules/.bin/prisma generate
fi

echo "Building application if needed..."
npm run build || echo "Build script failed but continuing..."

echo "Dependencies installation complete!" 