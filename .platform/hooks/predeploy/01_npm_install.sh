#!/bin/bash
# Log the beginning of the script
echo "Running deployment setup..."

# Navigate to source directory
cd /var/app/staging

# Create log directory if it doesn't exist
mkdir -p logs
chmod 777 logs

# Install dependencies with increased memory
echo "Installing dependencies..."
export NODE_OPTIONS="--max-old-space-size=2048"
npm ci || npm install

# Generate Prisma client with additional error handling
echo "Generating Prisma client..."
if [ -d "./prisma" ]; then
  npx prisma generate || echo "Warning: Prisma generation failed but continuing deployment"
else
  echo "No Prisma directory found, skipping"
fi

# Print environment for debugging (excluding secrets)
echo "Environment information:"
echo "NODE_ENV: $NODE_ENV"
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

echo "Setup complete." 