#!/bin/bash
# Post-deployment test script for AWS Elastic Beanstalk

# Exit on error
set -e

# Set log file path
LOG_FILE="/var/log/eb-postdeploy-tests.log"

# Log start of script execution
echo "$(date '+%Y-%m-%d %H:%M:%S') - Starting post-deployment seeding" >> $LOG_FILE

# Change to application directory
cd /var/app/current

# Log node and npm versions for debugging
echo "Node version: $(node -v)" >> $LOG_FILE
echo "NPM version: $(npm -v)" >> $LOG_FILE

# Run your test script here
# For example:
# node ./scripts/test-db-connection.js >> $LOG_FILE 2>&1
# npm run test:integration >> $LOG_FILE 2>&1

# Add your specific seed command below
echo "$(date '+%Y-%m-%d %H:%M:%S') - Running social media lawyers seed script" >> $LOG_FILE
node ./scripts/seed-social-media-lawyers.js >> $LOG_FILE 2>&1

# Log completion
echo "$(date '+%Y-%m-%d %H:%M:%S') - Post-deployment seeding completed with status $?" >> $LOG_FILE

# Return success
exit 0 