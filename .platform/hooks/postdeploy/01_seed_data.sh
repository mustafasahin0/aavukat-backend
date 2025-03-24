#!/bin/bash

# Change to the application directory
cd /var/app/current

# Log that we're about to run the seed command
echo "Running seed command to populate test data..."

# Download the Amazon DocumentDB certificate
echo "Downloading Amazon DocumentDB certificate..."
wget -O global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Run the seed command directly
echo "Seeding database..."
node prisma/seed.js

# Log completion
echo "Seed command completed"

# Exit with success status
exit 0 