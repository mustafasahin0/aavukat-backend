#!/bin/bash
# Log the beginning of the script
echo "Setting up Node.js environment..."

# Check if we're running on Amazon Linux 2
if [ -f /etc/system-release ]; then
  echo "Detected Amazon Linux"
  
  # Use the Amazon Linux specific Node.js setup
  if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl --silent --location https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum -y install nodejs
  else
    echo "Node.js is already installed"
  fi
fi

# Print versions for debugging
echo "Node.js version:"
node -v
echo "NPM version:"
npm -v

echo "Node.js setup complete." 