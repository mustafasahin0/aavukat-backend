# Post-Deployment Database Seeding on AWS Elastic Beanstalk

## Overview
The project includes a post-deployment seeding mechanism that runs automatically after the application is deployed to AWS Elastic Beanstalk. This ensures that the test environment is populated with sample data (social media lawyers).

## How It Works
- The `.platform/hooks/postdeploy/01_run_tests.sh` script runs automatically after deployment
- It executes the seed-social-media-lawyers.js script to populate the database with dummy lawyer data
- Results are logged to `/var/log/eb-postdeploy-tests.log` on the Elastic Beanstalk instance

## Accessing Logs
To view the seeding results:
1. Go to the AWS Elastic Beanstalk console
2. Select your environment
3. Click "Logs" in the left navigation
4. Request "Last 100 lines of logs" or "Full logs"
5. Look for the `eb-postdeploy-tests.log` entries

## Customizing Seeding
To modify the seeding process:
1. Edit the `.platform/hooks/postdeploy/01_run_tests.sh` script to run different seed scripts
2. Or modify the `scripts/seed-social-media-lawyers.js` file to change the seeding data
3. Ensure all output is directed to the log file: `>> $LOG_FILE 2>&1`

## Troubleshooting
If seeding fails:
1. Check the logs as described above
2. Verify environment variables are correctly set
3. Ensure the database is accessible from the Elastic Beanstalk environment
4. Check security group settings if connectivity issues occur 