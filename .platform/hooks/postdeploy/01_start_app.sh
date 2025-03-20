#!/bin/bash

# Check if app is running and restart if needed
cd /var/app/current

# Debug info
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

echo "PNPM version: $(pnpm --version)"
echo "Directory contents:"
ls -la
echo "Checking node_modules:"
ls -la node_modules || echo "No node_modules directory found"

# Ensure environment variables
if [ -f .env ]; then
  # Update PORT in .env if needed
  if grep -q "PORT=" .env; then
    sed -i 's/PORT=[0-9]*/PORT=8000/g' .env
  else
    echo "PORT=8000" >> .env
  fi
else
  echo "PORT=8000" > .env
fi

# Stop any running application
if pgrep -f "node dist/index.js" > /dev/null; then
  echo "Stopping existing Node.js application..."
  pkill -f "node dist/index.js" || true
  sleep 2
fi

# Check if core dependencies are missing
if [ ! -d "node_modules/cors" ] || [ ! -d "node_modules/express" ]; then
  echo "Critical dependencies are missing. Installing them with pnpm..."
  pnpm add cors express body-parser dotenv bcryptjs jsonwebtoken
  
  # Fix permissions for node_modules
  echo "Setting correct permissions on node_modules..."
  chmod -R 755 node_modules/
  chown -R webapp:webapp node_modules/ || true
fi

# Start the application using npm start
echo "Starting Node.js application on port 8000..."
PORT=8000 npm start > /var/log/nodejs_app.log 2>&1 &
echo "Application started with PID: $!"

# Verify the application is running
sleep 5
if pgrep -f "node dist/index.js" > /dev/null; then
  echo "Node.js application is running"
else
  echo "WARNING: Failed to start Node.js application"
  echo "Checking application logs for errors..."
  tail -n 20 /var/log/nodejs_app.log

  echo "Attempting to start application with node directly..."
  PORT=8000 node dist/index.js > /var/log/nodejs_app_direct.log 2>&1 &
  echo "Application started directly with PID: $!"
fi 