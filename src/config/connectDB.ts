import mongoose, { connect } from "mongoose";
import { MONGODB_URL, DATABASE_URL } from "./env";
import fs from 'fs';
import path from 'path';

// Function to find valid certificate path
const findValidCertPath = async (): Promise<string | null> => {
  const possiblePaths = [
    '/etc/ssl/certs/global-bundle.pem',  // Primary location
    './global-bundle.pem',               // App directory (relative)
    '/var/app/current/global-bundle.pem', // App directory (absolute)
    path.resolve(__dirname, '../../global-bundle.pem') // Relative to this file
  ];

  for (const certPath of possiblePaths) {
    try {
      await fs.promises.access(certPath, fs.constants.F_OK);
      console.log(`Found valid certificate at: ${certPath}`);
      return certPath;
    } catch (err) {
      console.log(`Certificate not found at: ${certPath}`);
    }
  }
  return null;
};

// Function to connect to the database
export const connectDB = async () => {
  try {
    // Choose DATABASE_URL if available, otherwise fall back to MONGODB_URL, or use a default local connection
    const connectionString = DATABASE_URL || MONGODB_URL || "mongodb://localhost:27017/default";
    
    // Log connection string with masked credentials
    const maskedUrl = connectionString.replace(
      /\/\/([^:]+):([^@]+)@/,
      '//***:***@'
    );
    console.log(`Connecting to database at ${maskedUrl}`);

    // Check if using DocumentDB (containing docdb in the URL)
    const isDocumentDb = connectionString.includes('docdb');
    
    let connectionOptions: any = {};
    
    if (isDocumentDb) {
      // For DocumentDB, we need to find the certificate
      const certPath = await findValidCertPath();
      
      if (!certPath) {
        console.error("ERROR: SSL certificate not found in any expected location!");
        console.error("Attempting to download certificate...");
        
        // Try to download certificate if it's missing
        const https = require('https');
        const certUrl = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
        const localCertPath = './global-bundle.pem';
        
        await new Promise<void>((resolve, reject) => {
          https.get(certUrl, (response: any) => {
            if (response.statusCode !== 200) {
              reject(new Error(`Failed to download certificate: ${response.statusCode}`));
              return;
            }
            
            const file = fs.createWriteStream(localCertPath);
            response.pipe(file);
            file.on('finish', () => {
              console.log(`Certificate downloaded to ${localCertPath}`);
              resolve();
            });
            file.on('error', (err: any) => {
              reject(err);
            });
          }).on('error', reject);
        });
        
        console.log("Using downloaded certificate.");
      }
    }

    // Connect to the database
    await connect(connectionString);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Error in Connecting MongoDB ", error);
    // Exit process with failure if connection fails
    process.exit(1);
  }
};
