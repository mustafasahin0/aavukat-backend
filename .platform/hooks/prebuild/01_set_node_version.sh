#!/bin/bash
# Log the beginning of the script
echo "Setting up Node.js environment..."

# Install Node.js 18.x directly using yum (more reliable in AWS environments)
echo "Installing Node.js 18.x..."
curl -sL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
sudo yum install -y nodejs

# Verify installation
echo "Node.js version:"
node -v
echo "NPM version:"
npm -v

echo "Node.js setup complete." 