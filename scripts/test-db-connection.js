// Test script for DocumentDB connection
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  // Use the DATABASE_URL environment variable or a test connection string
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Attempting to connect to database...');
  console.log(`Connection string (redacted): ${uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`);

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log('Connected successfully to DocumentDB!');
    
    // List all databases
    const dbs = await client.db().admin().listDatabases();
    console.log('Databases:');
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
    
    await client.close();
    console.log('Connection closed');
  } catch (err) {
    console.error('Failed to connect to DocumentDB:', err);
  }
}

testConnection(); 