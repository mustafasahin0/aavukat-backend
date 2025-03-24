// prisma/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Ensure URI is properly handled
let uri = process.env.DATABASE_URL;
if (!uri) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Function to properly encode MongoDB connection string
function encodeMongoURI(uri) {
  try {
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

// Handle the TLS certificate for DocumentDB
function prepareConnectionOptions(uri) {
  // Check if this is a TLS connection with certificate
  if (uri.includes('tlsCAFile=')) {
    // Extract the certificate filename
    const match = uri.match(/tlsCAFile=([^&]+)/);
    if (match && match[1]) {
      const certFile = match[1];
      
      // Check if the certificate file exists
      try {
        // Check both relative path and absolute path
        let certPath = certFile;
        if (!path.isAbsolute(certFile)) {
          certPath = path.join(process.cwd(), certFile);
        }

        if (fs.existsSync(certPath)) {
          console.log(`Found TLS certificate at ${certPath}`);
        } else {
          console.warn(`Warning: TLS certificate file not found at ${certPath}`);
          console.warn('Checking if we can download it...');
          
          // If using Amazon DocumentDB and the certificate is the standard global bundle
          if (certFile === 'global-bundle.pem' && !fs.existsSync('global-bundle.pem')) {
            console.warn('Certificate not found. Please make sure to download the Amazon DocumentDB certificate.');
          }
        }
      } catch (error) {
        console.error('Error checking for TLS certificate:', error);
      }
    }
  }
}

// Encode the URI properly
uri = encodeMongoURI(uri);
console.log('Using MongoDB connection string (sensitive parts redacted):', 
  uri.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://$1:****@'));

// Check for TLS certificate
prepareConnectionOptions(uri);

// Configure MongoDB client with appropriate options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 30000   // 30 seconds
};

// Create MongoDB client with the connection string
const client = new MongoClient(uri, mongoOptions);

async function main() {
  try {
    console.log('Starting to seed lawyers...');
    
    // Connect to MongoDB with retry logic
    let connected = false;
    let retries = 3;
    
    while (!connected && retries > 0) {
      try {
        await client.connect();
        connected = true;
        console.log('Connected to MongoDB');
      } catch (error) {
        retries--;
        console.error(`Failed to connect to MongoDB. ${retries} retries left.`, error);
        if (retries > 0) {
          console.log('Retrying connection in 5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }
    
    const db = client.db(); // Uses the database from the connection string

    // Clear existing lawyers and users
    console.log('Clearing existing lawyers and users...');
    await db.collection('Lawyer').deleteMany({});
    await db.collection('User').deleteMany({ role: 'lawyer' });
    console.log('Existing lawyers and users cleared successfully');
    
    // Create dummy lawyers with social media links
    const passwordHash = await bcrypt.hash('123456', 10);
    
    const lawyers = [
      {
        name: 'Jordan Parker',
        specialization: 'Environmental Law',
        experience: 9,
        barNumber: 'BN55555',
        jurisdictions: ['California', 'Oregon', 'Washington'],
        languages: ['English', 'German'],
        education: ['UC Berkeley School of Law'],
        certifications: ['Environmental Law Specialist'],
        firmName: 'Parker Environmental Law Group',
        rating: 4.6,
        phone: '+1-555-111-2222',
        profileImage: 'https://randomuser.me/api/portraits/men/20.jpg',
        instagramUrl: 'https://instagram.com/jordanparker',
        twitterUrl: 'https://twitter.com/jordanparker',
        linkedinUrl: 'https://linkedin.com/in/jordanparker',
        email: 'social.lawyer1@example.com'
      },
      {
        name: 'Samantha Lee',
        specialization: 'Civil Rights',
        experience: 11,
        barNumber: 'BN66666',
        jurisdictions: ['Federal', 'New York', 'Massachusetts'],
        languages: ['English', 'Korean', 'Spanish'],
        education: ['Harvard Law School'],
        certifications: ['Civil Rights Law Specialist'],
        firmName: 'Lee Civil Rights Advocates',
        rating: 4.9,
        phone: '+1-555-333-4444',
        profileImage: 'https://randomuser.me/api/portraits/women/21.jpg',
        instagramUrl: 'https://instagram.com/samanthalee',
        twitterUrl: 'https://twitter.com/samanthalee',
        linkedinUrl: 'https://linkedin.com/in/samanthalee',
        email: 'social.lawyer2@example.com'
      },
      {
        name: 'Marcus Johnson',
        specialization: 'Civil Rights',
        experience: 15,
        barNumber: 'BN77777',
        jurisdictions: ['Federal', 'Illinois', 'Michigan'],
        languages: ['English', 'French'],
        education: ['University of Chicago Law School'],
        certifications: ['Civil Rights Attorney', 'Constitutional Law Specialist'],
        firmName: 'Johnson Civil Rights Law',
        rating: 4.8,
        phone: '+1-555-777-8888',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
        instagramUrl: 'https://instagram.com/marcusjohnson',
        twitterUrl: 'https://twitter.com/marcusjohnson',
        linkedinUrl: 'https://linkedin.com/in/marcusjohnson',
        email: 'marcus.johnson@example.com'
      },
      {
        name: 'Elena Rodriguez',
        specialization: 'Immigration Law',
        experience: 9,
        barNumber: 'BN88888',
        jurisdictions: ['Federal', 'California', 'Arizona'],
        languages: ['English', 'Spanish', 'Portuguese'],
        education: ['Stanford Law School'],
        certifications: ['Immigration Rights Specialist', 'Civil Rights Advocate'],
        firmName: 'Rodriguez Rights Law Group',
        rating: 4.7,
        phone: '+1-555-222-6666',
        profileImage: 'https://randomuser.me/api/portraits/women/42.jpg',
        instagramUrl: 'https://instagram.com/elenarodriguez',
        twitterUrl: 'https://twitter.com/elenarodriguez',
        linkedinUrl: 'https://linkedin.com/in/elenarodriguez',
        email: 'elena.rodriguez@example.com'
      },
      {
        name: 'Benjamin Washington',
        specialization: 'Civil Rights',
        experience: 20,
        barNumber: 'BN99999',
        jurisdictions: ['Federal', 'New York', 'Georgia', 'Alabama'],
        languages: ['English'],
        education: ['Howard University School of Law'],
        certifications: ['Voting Rights Expert', 'Equal Employment Opportunity Specialist'],
        firmName: 'Washington Civil Liberties Firm',
        rating: 4.9,
        phone: '+1-555-444-9999',
        profileImage: 'https://randomuser.me/api/portraits/men/55.jpg',
        instagramUrl: 'https://instagram.com/benjaminwashington',
        twitterUrl: 'https://twitter.com/benjaminwashington',
        linkedinUrl: 'https://linkedin.com/in/benjaminwashington',
        email: 'benjamin.washington@example.com'
      },
      {
        name: 'Aisha Patel',
        specialization: 'Family Law',
        experience: 12,
        barNumber: 'BN11122',
        jurisdictions: ['New Jersey', 'New York', 'Pennsylvania'],
        languages: ['English', 'Hindi', 'Gujarati'],
        education: ['Columbia Law School'],
        certifications: ['Certified Family Law Specialist', 'Divorce Mediation'],
        firmName: 'Patel Family Law',
        rating: 4.8,
        phone: '+1-555-123-4567',
        profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
        instagramUrl: 'https://instagram.com/aishapatel',
        twitterUrl: 'https://twitter.com/aishapatel',
        linkedinUrl: 'https://linkedin.com/in/aishapatel',
        email: 'aisha.patel@example.com'
      },
      {
        name: 'Robert Chen',
        specialization: 'Intellectual Property',
        experience: 14,
        barNumber: 'BN33344',
        jurisdictions: ['Federal', 'California', 'Washington'],
        languages: ['English', 'Mandarin', 'Cantonese'],
        education: ['Berkeley Law', 'MIT (BS Computer Science)'],
        certifications: ['Patent Attorney', 'Trademark Specialist'],
        firmName: 'Chen IP Group',
        rating: 4.9,
        phone: '+1-555-987-6543',
        profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
        instagramUrl: 'https://instagram.com/robertchen',
        twitterUrl: 'https://twitter.com/robertchen',
        linkedinUrl: 'https://linkedin.com/in/robertchen',
        email: 'robert.chen@example.com'
      },
      {
        name: 'Maria Gonzalez',
        specialization: 'Criminal Defense',
        experience: 17,
        barNumber: 'BN55566',
        jurisdictions: ['Texas', 'Arizona', 'New Mexico'],
        languages: ['English', 'Spanish'],
        education: ['University of Texas School of Law'],
        certifications: ['Board Certified Criminal Law Specialist'],
        firmName: 'Gonzalez Defense Attorneys',
        rating: 4.7,
        phone: '+1-555-234-5678',
        profileImage: 'https://randomuser.me/api/portraits/women/28.jpg',
        instagramUrl: 'https://instagram.com/mariagonzalez',
        twitterUrl: 'https://twitter.com/mariagonzalez',
        linkedinUrl: 'https://linkedin.com/in/mariagonzalez',
        email: 'maria.gonzalez@example.com'
      },
      {
        name: 'James Wilson',
        specialization: 'Corporate Law',
        experience: 22,
        barNumber: 'BN77788',
        jurisdictions: ['Delaware', 'New York', 'California'],
        languages: ['English'],
        education: ['Yale Law School'],
        certifications: ['Corporate Governance Professional', 'Mergers & Acquisitions Specialist'],
        firmName: 'Wilson Business Law Partners',
        rating: 4.9,
        phone: '+1-555-345-6789',
        profileImage: 'https://randomuser.me/api/portraits/men/92.jpg',
        instagramUrl: 'https://instagram.com/jameswilson',
        twitterUrl: 'https://twitter.com/jameswilson',
        linkedinUrl: 'https://linkedin.com/in/jameswilson',
        email: 'james.wilson@example.com'
      },
      {
        name: 'Olivia Kim',
        specialization: 'Employment Law',
        experience: 8,
        barNumber: 'BN99900',
        jurisdictions: ['California', 'Oregon'],
        languages: ['English', 'Korean'],
        education: ['UCLA School of Law'],
        certifications: ['Employment Rights Specialist', 'Workplace Compliance Expert'],
        firmName: 'Kim Employment Law Group',
        rating: 4.6,
        phone: '+1-555-456-7890',
        profileImage: 'https://randomuser.me/api/portraits/women/39.jpg',
        instagramUrl: 'https://instagram.com/oliviakim',
        twitterUrl: 'https://twitter.com/oliviakim',
        linkedinUrl: 'https://linkedin.com/in/oliviakim',
        email: 'olivia.kim@example.com'
      }
    ];

    // Insert each new lawyer
    for (const lawyerData of lawyers) {
      try {
        // Create user
        const now = new Date();
        const user = {
          email: lawyerData.email,
          password: passwordHash,
          role: 'lawyer',
          isVerified: true,
          isBlocked: false,
          createdAt: now,
          updatedAt: now
        };
        
        console.log(`Creating user: ${lawyerData.email}`);
        const userResult = await db.collection('User').insertOne(user);
        const userId = userResult.insertedId;
        
        // Create lawyer with social media links
        const lawyer = {
          userId: userId,
          name: lawyerData.name,
          phone: lawyerData.phone,
          profileImage: lawyerData.profileImage,
          specialization: lawyerData.specialization,
          experience: lawyerData.experience,
          barNumber: lawyerData.barNumber,
          jurisdictions: lawyerData.jurisdictions,
          languages: lawyerData.languages,
          education: lawyerData.education,
          certifications: lawyerData.certifications,
          firmName: lawyerData.firmName,
          rating: lawyerData.rating,
          instagramUrl: lawyerData.instagramUrl,
          twitterUrl: lawyerData.twitterUrl,
          linkedinUrl: lawyerData.linkedinUrl
        };
        
        await db.collection('Lawyer').insertOne(lawyer);
        
        console.log(`Created new lawyer: ${lawyerData.name}`);
      } catch (error) {
        console.error(`Error creating lawyer ${lawyerData.name}:`, error);
      }
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main(); 