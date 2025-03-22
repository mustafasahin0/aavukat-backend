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
    let connectionString = DATABASE_URL || MONGODB_URL || "mongodb://localhost:27017/default";
    
    // URL encode username and password in connection string
    if (connectionString.includes('@')) {
      const urlParts = connectionString.split('//');
      const authAndRest = urlParts[1].split('@');
      const credentials = authAndRest[0].split(':');
      
      // URL encode username and password
      const encodedUsername = encodeURIComponent(credentials[0]);
      const encodedPassword = encodeURIComponent(credentials[1]);
      
      // Reconstruct the connection string with encoded credentials
      connectionString = `${urlParts[0]}//${encodedUsername}:${encodedPassword}@${authAndRest[1]}`;
      
      // For DocumentDB, make sure we're using the admin authentication database
      if (connectionString.includes('docdb') && !connectionString.includes('authSource=')) {
        connectionString += connectionString.includes('?') ? '&authSource=admin' : '?authSource=admin';
      }
    }
    
    // Log connection string with masked credentials
    const maskedUrl = connectionString.replace(
      /\/\/([^:]+):([^@]+)@/,
      '//***:***@'
    );
    console.log(`Connecting to database at ${maskedUrl}`);

    // Check if using DocumentDB (containing docdb in the URL)
    const isDocumentDb = connectionString.includes('docdb');
    
    if (isDocumentDb) {
      // For DocumentDB, we need to find the certificate
      const certPath = await findValidCertPath();
      
      if (certPath) {
        // We found a valid certificate, use it for the connection
        console.log(`Using certificate at: ${certPath}`);
        
        // Create a new connection string with the correct certificate path
        // First, extract the base URL and parameters
        const urlParts = connectionString.split('?');
        const baseUrl = urlParts[0];
        const paramsString = urlParts.length > 1 ? urlParts[1] : '';
        
        // Parse the parameters
        const params = new URLSearchParams(paramsString);
        
        // Update the certificate path
        params.set('tlsCAFile', certPath);
        
        // Rebuild the connection string
        const updatedConnectionString = `${baseUrl}?${params.toString()}`;
        console.log(`Using modified connection string with correct certificate path`);
        
        await connect(updatedConnectionString);
      } else {
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
        
        // Try connecting with the downloaded certificate
        const urlParts = connectionString.split('?');
        const baseUrl = urlParts[0];
        const paramsString = urlParts.length > 1 ? urlParts[1] : '';
        const params = new URLSearchParams(paramsString);
        params.set('tlsCAFile', localCertPath);
        const updatedConnectionString = `${baseUrl}?${params.toString()}`;
        
        await connect(updatedConnectionString);
      }
    } else {
      // Standard MongoDB connection
      await connect(connectionString);
    }
    
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Error in Connecting MongoDB ", error);
    // Exit process with failure if connection fails
    process.exit(1);
  }
};
