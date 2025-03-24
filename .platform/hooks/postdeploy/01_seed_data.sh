#!/bin/bash

# Change to the application directory
cd /var/app/current

# Log that we're about to run the seed command
echo "Running seed command to populate test data..."

# Run the seed command directly
echo "Seeding database..."
node prisma/seed.js

# Log completion
echo "Seed command completed"

# Exit with success status
exit 0 