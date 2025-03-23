# AWS Deployment Instructions

This document provides instructions for deploying the aavukat-backend application to AWS Elastic Beanstalk using CodePipeline.

## Prerequisites

1. An AWS account with appropriate permissions
2. GitHub repository with your application code
3. MongoDB database (Atlas or other)

## Deployment Steps

### 1. Set Up AWS Elastic Beanstalk

1. Go to the Elastic Beanstalk console in AWS
2. Click "Create Application"
3. Enter your application name (e.g., "aavukat-backend")
4. For Platform, select "Node.js"
5. For Application code, select "Sample application" initially
6. Click "Create application"

### 2. Configure Environment Variables

Once your environment is created:

1. Go to Configuration > Software
2. Add the following environment variables:
   - `DATABASE_URL`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `PORT`: `8080`
   - `CLIENT_URL`: Your frontend application URL
   - `AWS_REGION`: Your AWS region
   - `AWS_ACCESS_KEY_ID`: AWS access key
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key
   - `S3_BUCKET_NAME`: Your S3 bucket name
   - `SENDER_EMAIL`: Your email for sending notifications
   - `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
   - `STRIPE_SECRET_KEY`: Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
   - `GEMINI_API_KEY`: Google Gemini API key
3. Save the changes

### 3. Set Up CodePipeline

1. Go to the CodePipeline console in AWS
2. Click "Create pipeline"
3. Enter a pipeline name (e.g., "aavukat-pipeline")
4. For Service role, select "New service role" and click "Next"

5. **Source Stage:**
   - For Source provider, select "GitHub (Version 2)"
   - Connect to GitHub and select your repository and branch
   - Enable "Start the pipeline on source code change"
   - Click "Next"

6. **Build Stage:**
   - For Build provider, select "AWS CodeBuild"
   - Create a new build project
   - Environment: Select "Managed image" with "Amazon Linux 2" and Node.js 18
   - Buildspec: Use the buildspec.yml in your repository
   - Click "Continue to CodePipeline" and "Next"

7. **Deploy Stage:**
   - For Deploy provider, select "AWS Elastic Beanstalk"
   - Select your application and environment
   - Click "Next" and "Create pipeline"

### 4. Monitoring and Troubleshooting

- Monitor your deployment in the CodePipeline console
- Check Elastic Beanstalk logs if there are issues
- For WebSocket issues, check the Nginx configuration 


# Notes for Creating QA Env

- Create Document DB cluster and change SG to DB SG
- Create Elastic Bean Stack with Env Configs with Sample App
   - App server Sg
   - Load Balancer: Select Public subnets for Load Balancer (Later go to load balancer and change SG to Load Balancer SG)
   - Select 443 Listener
   - After deployment go to route 53 and configure 443 Listener certificate
   
- Amplify:
   - Create Env
   - Later on configure Domain

- AWS Ses
   - no-reply@aavukat.com