#!/bin/bash

# Change to the application directory
cd /var/app/current

# Load environment variables from AWS environment
source /opt/elasticbeanstalk/support/envvars

# Log that we're about to run the seed command
echo "Running seed command to populate test data..."

# Run the seed command
npm run seed-test-data

# Log completion
echo "Seed command completed"

# Exit with success status
exit 0 