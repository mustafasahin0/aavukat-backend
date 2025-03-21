import dotenv from "dotenv";
dotenv.config();

const {
   PORT,
   NODE_ENV,
   CLIENT_URL,
   AWS_REGION,
   MONGODB_URL,
   SENDER_EMAIL,
   S3_BUCKET_NAME,
   STRIPE_SECRET_KEY,
   AWS_ACCESS_KEY_ID,
   ACCESS_TOKEN_SECRET,
   REFRESH_TOKEN_SECRET,
   STRIPE_WEBHOOK_SECRET,
   AWS_SECRET_ACCESS_KEY,
   GEMINI_API_KEY,
   SMTP_SES_USER_NAME,
   SMTP_SES_PASSWORD,
} = process.env;

export {
   PORT,
   NODE_ENV,
   CLIENT_URL,
   AWS_REGION,
   MONGODB_URL,
   SENDER_EMAIL,
   S3_BUCKET_NAME,
   STRIPE_SECRET_KEY,
   AWS_ACCESS_KEY_ID,
   ACCESS_TOKEN_SECRET,
   REFRESH_TOKEN_SECRET,
   STRIPE_WEBHOOK_SECRET,
   AWS_SECRET_ACCESS_KEY,
   GEMINI_API_KEY,
   SMTP_SES_USER_NAME,
   SMTP_SES_PASSWORD,
};
