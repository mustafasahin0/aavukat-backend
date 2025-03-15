#!/bin/bash
# Log the beginning of the script
echo "Running npm install and build..."

# Navigate to source directory
cd /var/app/staging

# Install dependencies
echo "Installing dependencies..."
npm install

# Generating Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "npm setup complete." 