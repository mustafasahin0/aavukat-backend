import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';

// Define a function to safely URL encode MongoDB connection strings
function encodeMongoURI(uri: string): string {
  try {
    if (!uri) return uri;
    
    // Only process mongodb:// URIs
    if (!uri.startsWith('mongodb://')) {
      return uri; // Return as is for mongodb+srv:// or other formats
    }
    
    // Split the URI into components
    const parts = uri.split('@');
    if (parts.length < 2) return uri; // Not a typical auth URI
    
    const authPart = parts[0];
    const restPart = parts.slice(1).join('@');
    
    // Split auth part to get username and password
    const authComponents = authPart.split(':');
    if (authComponents.length < 3) return uri; // Not a typical username:password format
    
    const protocol = authComponents[0];
    const username = authComponents[1];
    // Password is everything between the first colon after username and the @
    const password = authComponents.slice(2).join(':');
    
    // Encode the password properly
    const encodedPassword = encodeURIComponent(password);
    
    // Reconstruct the URI
    return `${protocol}:${username}:${encodedPassword}@${restPart}`;
  } catch (e) {
    console.warn('Error encoding MongoDB URI, using original:', e);
    return uri;
  }
}

// Function to find a valid certificate for DocumentDB
function findDocumentDBCertificate(): string | null {
  // Possible locations where the certificate might be found
  const possiblePaths = [
    '/var/app/current/global-bundle.pem',  // Elastic Beanstalk app directory
    './global-bundle.pem',                 // Relative to working directory
    path.resolve(__dirname, '../../global-bundle.pem'), // Relative to this file
    '/etc/ssl/certs/global-bundle.pem'     // System SSL certs directory
  ];

  for (const certPath of possiblePaths) {
    try {
      if (fs.existsSync(certPath)) {
        console.log(`Found DocumentDB certificate at: ${certPath}`);
        return certPath;
      }
    } catch (e) {
      // Continue checking other paths
    }
  }
  
  console.warn('DocumentDB certificate not found in any of the expected locations');
  return null;
}

// Function to download the certificate if not found
async function downloadCertificate(): Promise<string | null> {
  console.log("Attempting to download certificate...");
  const https = require('https');
  const certUrl = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
  const localCertPath = path.resolve(process.cwd(), 'global-bundle.pem'); // Use absolute path
  
  try {
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
    
    return localCertPath;
  } catch (error) {
    console.error("Failed to download certificate:", error);
    return null;
  }
}

// Ensure properly encoded MongoDB connection string with correct DocumentDB parameters
if (process.env.DATABASE_URL) {
  // First encode the URI
  let connectionString = encodeMongoURI(process.env.DATABASE_URL);
  
  // Check if this is DocumentDB (in AWS environment)
  if (process.env.NODE_ENV === 'production' || 
      connectionString.includes('docdb') || 
      connectionString.includes('rds.amazonaws.com')) {
    
    // Find the certificate file
    let certPath = findDocumentDBCertificate();
    
    // If certificate isn't found, try to download it
    if (!certPath) {
      console.error('ERROR: DocumentDB certificate not found, attempting to download...');
      
      // Use IIFE to handle the async operation
      (async () => {
        try {
          const downloadedPath = await downloadCertificate();
          if (downloadedPath) {
            updateConnectionString(connectionString, downloadedPath);
          } else {
            console.error('ERROR: Failed to download DocumentDB certificate');
          }
        } catch (err) {
          console.error('ERROR: Failed to download DocumentDB certificate:', err);
        }
      })();
    } else {
      updateConnectionString(connectionString, certPath);
    }
  }
}

// Function to update the connection string with the certificate path
function updateConnectionString(connectionString: string, certPath: string) {
  // Parse the existing URL
  const [baseUrl, params = ''] = connectionString.split('?');
  const searchParams = new URLSearchParams(params);
  
  // Set required DocumentDB connection parameters
  searchParams.set('tls', 'true');
  searchParams.set('tlsCAFile', certPath);
  searchParams.set('retryWrites', 'false'); // DocumentDB doesn't support retryWrites
  
  if (!searchParams.has('authSource')) {
    searchParams.set('authSource', 'admin');
  }
  
  // Rebuild the connection string
  const updatedConnectionString = `${baseUrl}?${searchParams.toString()}`;
  console.log('DocumentDB connection configured with SSL certificate');
  
  // Update the environment variable with the modified connection string
  process.env.DATABASE_URL = updatedConnectionString;
}

// Create a singleton Prisma client instance for the entire application
export const prisma = new PrismaClient({
  log: ["error", "warn"],
});
