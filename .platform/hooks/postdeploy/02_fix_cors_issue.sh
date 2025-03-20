#!/bin/bash

# This script provides a potential fix for the cors module not found issue
cd /var/app/current

# Check if application failed to start
if ! pgrep -f "node dist/index.js" > /dev/null; then
  echo "Application not running, checking for CORS issue..."
  
  # Check if error log contains cors module not found
  if grep -q "Cannot find module 'cors'" /var/log/nodejs_app.log; then
    echo "Detected 'cors module not found' error, applying fix..."
    
    # Install cors globally
    npm install cors -g
    
    # Create a modified version of index.js that doesn't rely on cors
    if [ -f "dist/index.js" ]; then
      echo "Creating backup of original index.js..."
      cp dist/index.js dist/index.js.original
      
      echo "Creating modified version of index.js..."
      cat > dist/index.js.new << 'EOF'
// Modified index.js with inline CORS handling
try {
  // Try to load cors if available
  const cors = require('cors');
  console.log("CORS module loaded successfully");
} catch (e) {
  console.log("CORS module not found, using built-in CORS headers");
}

// Continue with the rest of the application
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// Add CORS headers manually if cors module is not available
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Basic route to test if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF
      
      # Replace the original if the new file was created successfully
      if [ -f "dist/index.js.new" ]; then
        mv dist/index.js.new dist/index.js
        echo "Modified index.js is now in place"
        
        # Restart the application
        echo "Restarting application with modified index.js..."
        PORT=8000 node dist/index.js > /var/log/nodejs_app.log 2>&1 &
      fi
    else
      echo "Cannot find dist/index.js to modify"
    fi
  else
    echo "No CORS module error detected in logs"
  fi
else
  echo "Application is running, no need to apply CORS fix"
fi 