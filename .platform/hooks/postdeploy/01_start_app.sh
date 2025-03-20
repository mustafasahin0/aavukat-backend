#!/bin/bash

# Check if app is running and restart if needed
cd /var/app/current

# Debug info
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

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

# Direct fix - Install missing modules directly with npm
echo "Direct fix - Installing missing dependencies..."
cd /var/app/current
npm install cors express body-parser dotenv bcryptjs jsonwebtoken --save

# Make sure dependencies are properly linked
echo "Checking node_modules structure..."
if [ ! -d "node_modules/cors" ]; then
  echo "CORS module not found - installing it directly..."
  npm install cors --save
fi

# Fix permissions if needed
echo "Ensuring correct permissions..."
chmod -R 755 node_modules/

# Start the application with npm (more reliable)
echo "Starting Node.js application on port 8000..."
PORT=8000 node dist/index.js > /var/log/nodejs_app.log 2>&1 &
echo "Application started!"

# Verify the application is running
sleep 5
if pgrep -f "node dist/index.js" > /dev/null; then
  echo "Node.js application is running"
else
  echo "WARNING: Failed to start Node.js application"
  echo "Checking application logs for errors..."
  tail -n 20 /var/log/nodejs_app.log
fi 