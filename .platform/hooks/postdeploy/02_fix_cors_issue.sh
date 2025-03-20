#!/bin/bash

# This script provides a fix for the cors module not found issue
cd /var/app/current

# Function to check for cors error in logs
check_for_cors_error() {
  echo "Checking for CORS errors in logs..."
  grep -q "Cannot find module 'cors'" /var/log/eb-engine.log || \
  grep -q "Cannot find module 'cors'" /var/log/web.stdout.log || \
  grep -q "Cannot find module 'cors'" /var/log/nodejs_app.log
  return $?
}

# Try to install cors if application failed to start due to cors issue
if ! pgrep -f "node dist/index.js" > /dev/null || check_for_cors_error; then
  echo "Application not running correctly or CORS issues detected"
  
  # Install cors in both the local and global context to ensure availability
  echo "Installing cors package..."
  npm install cors --save
  npm install cors -g
  
  # Create a symlink from global to local if needed
  echo "Creating symlink to global cors if needed..."
  if [ ! -d "node_modules/cors" ] && [ -d "/usr/local/lib/node_modules/cors" ]; then
    mkdir -p node_modules
    ln -sf /usr/local/lib/node_modules/cors node_modules/cors
  fi
  
  # Modify the index.js file only as a last resort if cors still can't be found
  if ! node -e "require('cors'); console.log('CORS can be loaded');" 2>/dev/null; then
    echo "CORS module still not loadable, applying fallback solution..."
    
    if [ -f "dist/index.js" ]; then
      echo "Creating backup of original index.js..."
      cp dist/index.js dist/index.js.original
      
      echo "Patching index.js to handle missing cors..."
      sed -i '1i\// Patched to handle missing cors module\ntry {\n  global.cors = require("cors");\n} catch (e) {\n  global.cors = function() {\n    return function(req, res, next) {\n      res.header("Access-Control-Allow-Origin", "*");\n      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");\n      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");\n      if (req.method === "OPTIONS") return res.sendStatus(200);\n      next();\n    };\n  };\n}\n' dist/index.js
    fi
  fi
  
  # Restart the application
  echo "Restarting application..."
  systemctl restart nodejs
else
  echo "Application is running and no CORS issues detected"
fi 