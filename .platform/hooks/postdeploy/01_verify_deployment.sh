#!/bin/bash
# Log the beginning of the script
echo "Verifying deployment..."

# Get application status
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health || echo "Failed to connect")

echo "Application health check status: $APP_STATUS"

# Print useful environment information for debugging
echo "Application environment:"
echo "NODE_ENV: $NODE_ENV"

# Check if node_modules exists
if [ -d "/var/app/current/node_modules" ]; then
  echo "node_modules directory exists in the current application directory"
else
  echo "Warning: node_modules directory does not exist in the current application directory"
fi

# Check if dist directory exists
if [ -d "/var/app/current/dist" ]; then
  echo "dist directory exists in the current application directory"
else
  echo "Warning: dist directory does not exist in the current application directory"
fi

echo "Deployment verification complete." 