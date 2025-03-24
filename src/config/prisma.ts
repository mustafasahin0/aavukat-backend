import { PrismaClient } from "@prisma/client";

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

// Ensure properly encoded MongoDB connection string
if (process.env.DATABASE_URL) {
   process.env.DATABASE_URL = encodeMongoURI(process.env.DATABASE_URL);
}

// Create a singleton Prisma client instance for the entire application
export const prisma = new PrismaClient({
   log: ["error", "warn"],
});
