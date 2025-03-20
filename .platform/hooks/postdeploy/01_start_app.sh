#!/bin/bash

# Check if app is running and restart if needed
cd /var/app/current

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

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

# Install dependencies properly
echo "Installing dependencies with pnpm..."
pnpm install

# Check if app is running
if pgrep -f "node dist/index.js" > /dev/null; then
  echo "Restarting Node.js application..."
  pkill -f "node dist/index.js" || true
  sleep 2
fi

# Start the application
echo "Starting Node.js application on port 8000..."
PORT=8000 pnpm start > /var/log/nodejs_app.log 2>&1 &
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