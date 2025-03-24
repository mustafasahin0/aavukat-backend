#!/usr/bin/env node

// Test script to verify DocumentDB connection
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Find the certificate
function findCertificate() {
  const possiblePaths = [
    '/var/app/current/global-bundle.pem',
    './global-bundle.pem',
    path.resolve(__dirname, '../global-bundle.pem'),
    '/etc/ssl/certs/global-bundle.pem'
  ];

  for (const certPath of possiblePaths) {
    try {
      if (fs.existsSync(certPath)) {
        console.log(`Found certificate at: ${certPath}`);
        return certPath;
      }
    } catch (e) {
      // Continue checking
    }
  }
  console.error('Certificate not found in any of the expected locations');
  return null;
}

async function testConnection() {
  console.log('Testing DocumentDB connection...');
  
  // Log the DATABASE_URL (masked)
  const maskedUrl = process.env.DATABASE_URL?.replace(
    /\/\/([^:]+):([^@]+)@/,
    '//***:***@'
  ) || 'Not set';
  console.log(`Using DATABASE_URL: ${maskedUrl}`);
  
  // Check if certificate is in the URL and exists
  if (process.env.DATABASE_URL?.includes('tlsCAFile')) {
    const match = process.env.DATABASE_URL.match(/tlsCAFile=([^&]+)/);
    if (match && match[1]) {
      const certPath = match[1];
      console.log(`Certificate path in URL: ${certPath}`);
      
      if (fs.existsSync(certPath)) {
        console.log(`✅ Certificate exists at ${certPath}`);
      } else {
        console.error(`❌ Certificate NOT found at ${certPath}`);
      }
    }
  } else {
    console.log('No certificate specified in DATABASE_URL');
    
    // Try to find certificate
    const certPath = findCertificate();
    if (certPath) {
      console.log(`Consider adding ?tlsCAFile=${certPath} to your connection string`);
    }
  }
  
  try {
    // Initialize Prisma Client
    const prisma = new PrismaClient();
    
    // Test connection by querying the Lawyer model
    console.log('Attempting to query Lawyer model...');
    const count = await prisma.lawyer.count();
    console.log(`✅ Connection successful! Found ${count} lawyers in the database.`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Connection failed with error:', error);
  }
}

// Run the test
testConnection()
  .catch(console.error)
  .finally(() => {
    console.log('Test completed.');
  }); 