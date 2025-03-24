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

// Ensure properly encoded MongoDB connection string with correct DocumentDB parameters
if (process.env.DATABASE_URL) {
  // First encode the URI
  let connectionString = encodeMongoURI(process.env.DATABASE_URL);
  
  // Check if this is DocumentDB (in AWS environment)
  if (process.env.NODE_ENV === 'production' || 
      connectionString.includes('docdb') || 
      connectionString.includes('rds.amazonaws.com')) {
    
    // Find the certificate file
    const certPath = findDocumentDBCertificate();
    
    if (certPath) {
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
      connectionString = `${baseUrl}?${searchParams.toString()}`;
      console.log('DocumentDB connection configured with SSL certificate');
    } else {
      console.error('ERROR: DocumentDB certificate not found, connection may fail!');
    }
  }
  
  // Update the environment variable with the modified connection string
  process.env.DATABASE_URL = connectionString;
}

// Create a singleton Prisma client instance for the entire application
export const prisma = new PrismaClient({
  log: ["error", "warn"],
});
