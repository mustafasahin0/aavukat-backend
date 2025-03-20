#!/bin/bash
set -e

# This script provides a fix for the cors module not found issue
cd /var/app/current

echo "==== CORS ISSUE DEBUGGING INFORMATION ===="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory structure:"
ls -la
echo "node_modules directory:"
ls -la node_modules 2>/dev/null || echo "node_modules directory not found"
echo "Package.json contents:"
cat package.json
echo "=========================================="

# Function to check for cors error in logs
check_for_cors_error() {
  echo "Checking for CORS errors in logs..."
  local has_error=false
  
  if grep -q "Cannot find module 'cors'" /var/log/eb-engine.log 2>/dev/null; then
    echo "Found CORS error in eb-engine.log"
    has_error=true
  fi
  
  if grep -q "Cannot find module 'cors'" /var/log/web.stdout.log 2>/dev/null; then
    echo "Found CORS error in web.stdout.log"
    has_error=true
  fi
  
  if grep -q "Cannot find module 'cors'" /var/log/nodejs_app.log 2>/dev/null; then
    echo "Found CORS error in nodejs_app.log"
    has_error=true
  fi
  
  if $has_error; then
    return 0
  else
    return 1
  fi
}

# Try to install cors if application failed to start due to cors issue
if ! pgrep -f "node dist/index.js" > /dev/null || check_for_cors_error; then
  echo "Application not running correctly or CORS issues detected"
  
  # Fix node_modules permissions
  echo "Fixing permissions..."
  chmod -R 755 ./node_modules 2>/dev/null || echo "Could not set permissions on node_modules"
  
  # Install cors locally
  echo "Installing cors package locally..."
  npm install cors --save --no-package-lock --no-audit
  
  # Install cors globally
  echo "Installing cors package globally..."
  npm install cors -g
  
  # Create symlinks to ensure module is available
  echo "Creating symlinks for cors..."
  if [ ! -d "node_modules/cors" ] && [ -d "/usr/local/lib/node_modules/cors" ]; then
    mkdir -p node_modules
    ln -sf /usr/local/lib/node_modules/cors node_modules/cors
    echo "Created symlink from global to local cors"
  fi
  
  # Check if cors is now available
  if node -e "try { require.resolve('cors'); console.log('CORS module can be resolved'); } catch(e) { console.error(e); process.exit(1); }" 2>/dev/null; then
    echo "CORS module is now loadable"
  else
    echo "CORS module still not loadable, applying fallback solution..."
    
    if [ -f "dist/index.js" ]; then
      echo "Creating backup of original index.js..."
      cp dist/index.js dist/index.js.original
      
      echo "Patching index.js to handle missing cors..."
      cat > dist/index.js.patched << 'EOF'
// Patched to handle missing cors module
try {
  global.cors = require('cors');
  console.log("Successfully loaded the cors module");
} catch (e) {
  console.log("Could not load cors module, using fallback implementation");
  global.cors = function(options) {
    return function(req, res, next) {
      res.header("Access-Control-Allow-Origin", options && options.origin ? options.origin : "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.header("Access-Control-Allow-Credentials", options && options.credentials ? "true" : "false");
      if (req.method === "OPTIONS") return res.sendStatus(200);
      next();
    };
  };
}

EOF
      
      # Prepend the patch to the original file
      cat dist/index.js.patched dist/index.js > dist/index.js.new
      mv dist/index.js.new dist/index.js
      echo "Applied patch to dist/index.js"
    fi
  fi
  
  # Restart the application
  echo "Restarting application..."
  systemctl restart nodejs || systemctl restart web || pm2 restart all || echo "Could not restart using systemctl or pm2"
else
  echo "Application is running and no CORS issues detected"
fi 