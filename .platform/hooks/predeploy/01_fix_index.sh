#!/bin/bash

echo "=== START INDEX.JS PATCH ==="

cd /var/app/staging

# Create a backup directory if it doesn't exist
mkdir -p backups

# Check if dist/index.js exists and backup it
if [ -f "dist/index.js" ]; then
  echo "Found dist/index.js - creating backup"
  cp dist/index.js backups/index.js.bak.$(date +%s)
  
  # Patch index.js to handle missing cors module
  echo "Patching index.js to handle missing cors"
  
  # Create the patched header
  cat > dist/index.js.header << 'EOF'
// ======== PATCHED CORS IMPLEMENTATION ========
// This section adds a fallback implementation for the cors module
// if it's not available in the environment

// Define a fallback cors implementation
const createFallbackCors = () => {
  console.log("Using fallback CORS implementation");
  return (options = {}) => {
    return (req, res, next) => {
      // Set default options
      const defaults = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: false
      };
      
      // Merge options with defaults
      const corsOptions = { ...defaults, ...options };
      
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', corsOptions.origin);
      
      if (corsOptions.credentials === true) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', corsOptions.methods);
        res.setHeader('Access-Control-Allow-Headers', 
          options.allowedHeaders || 'Content-Type, Authorization, Content-Length, X-Requested-With');
        
        if (corsOptions.maxAge) {
          res.setHeader('Access-Control-Max-Age', corsOptions.maxAge);
        }
        
        return res.status(corsOptions.optionsSuccessStatus).end();
      }
      
      next();
    };
  };
};

// Try to require the real cors module first, fallback to our implementation if not found
let cors;
try {
  cors = require('cors');
  console.log("Using actual cors module");
} catch (e) {
  console.log("Cors module not found, using fallback implementation");
  cors = createFallbackCors();
}

// Export cors as a global to ensure it's available
global.cors = cors;

// ======== END PATCHED CORS IMPLEMENTATION ========

EOF
  
  # Combine the header with the original file
  cat dist/index.js.header dist/index.js > dist/index.js.new
  mv dist/index.js.new dist/index.js
  
  echo "Index.js has been patched"
else
  echo "dist/index.js not found, nothing to patch"
fi

echo "=== END INDEX.JS PATCH ===" 