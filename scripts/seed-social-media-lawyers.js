// Seed script to add lawyers with social media links
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

async function main() {
  try {
    console.log('Starting to seed lawyers with social media links...');
    
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(); // Uses the database from the connection string

    // Update existing lawyers with social media links
    const lawyers = await db.collection('Lawyer').find({}).toArray();
    
    console.log(`Found ${lawyers.length} lawyers to update with social media links`);
    
    for (const lawyer of lawyers) {
      // Generate social media links based on name
      const name = lawyer.name;
      const nameForUrl = name.toLowerCase().replace(/\s+/g, '');
      
      const updates = {
        instagramUrl: `https://instagram.com/${nameForUrl}`,
        twitterUrl: `https://twitter.com/${nameForUrl}`,
        linkedinUrl: `https://linkedin.com/in/${nameForUrl}`
      };
      
      // Update lawyer record
      await db.collection('Lawyer').updateOne(
        { _id: lawyer._id },
        { $set: updates }
      );
      
      console.log(`Updated lawyer: ${name} with social media links`);
    }
    
    // Additionally, let's create a couple of new lawyers with social media links
    const passwordHash = await bcrypt.hash('123456', 10);
    
    const newLawyers = [
      {
        email: 'social.lawyer1@example.com',
        name: 'Jordan Parker',
        password: passwordHash,
        phone: '+1-555-111-2222',
        profileImage: 'https://randomuser.me/api/portraits/men/20.jpg',
        specialization: 'Environmental Law',
        experience: 9,
        barNumber: 'BN55555',
        jurisdictions: ['California', 'Oregon', 'Washington'],
        languages: ['English', 'German'],
        education: ['UC Berkeley School of Law'],
        certifications: ['Environmental Law Specialist'],
        firmName: 'Parker Environmental Law Group',
        rating: 4.6,
        instagramUrl: 'https://instagram.com/jordanparker',
        twitterUrl: 'https://twitter.com/jordanparker',
        linkedinUrl: 'https://linkedin.com/in/jordanparker'
      },
      {
        email: 'social.lawyer2@example.com',
        name: 'Samantha Lee',
        password: passwordHash,
        phone: '+1-555-333-4444',
        profileImage: 'https://randomuser.me/api/portraits/women/21.jpg',
        specialization: 'Civil Rights',
        experience: 11,
        barNumber: 'BN66666',
        jurisdictions: ['Federal', 'New York', 'Massachusetts'],
        languages: ['English', 'Korean', 'Spanish'],
        education: ['Harvard Law School'],
        certifications: ['Civil Rights Law Specialist'],
        firmName: 'Lee Civil Rights Advocates',
        rating: 4.9,
        instagramUrl: 'https://instagram.com/samanthalee',
        twitterUrl: 'https://twitter.com/samanthalee',
        linkedinUrl: 'https://linkedin.com/in/samanthalee'
      },
      {
        email: 'marcus.johnson@example.com',
        name: 'Marcus Johnson',
        password: passwordHash,
        phone: '+1-555-777-8888',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
        specialization: 'Civil Rights',
        experience: 15,
        barNumber: 'BN77777',
        jurisdictions: ['Federal', 'Illinois', 'Michigan'],
        languages: ['English', 'French'],
        education: ['University of Chicago Law School'],
        certifications: ['Civil Rights Attorney', 'Constitutional Law Specialist'],
        firmName: 'Johnson Civil Rights Law',
        rating: 4.8,
        instagramUrl: 'https://instagram.com/marcusjohnson',
        twitterUrl: 'https://twitter.com/marcusjohnson',
        linkedinUrl: 'https://linkedin.com/in/marcusjohnson'
      },
      {
        email: 'elena.rodriguez@example.com',
        name: 'Elena Rodriguez',
        password: passwordHash,
        phone: '+1-555-222-6666',
        profileImage: 'https://randomuser.me/api/portraits/women/42.jpg',
        specialization: 'Civil Rights',
        experience: 9,
        barNumber: 'BN88888',
        jurisdictions: ['Federal', 'California', 'Arizona'],
        languages: ['English', 'Spanish', 'Portuguese'],
        education: ['Stanford Law School'],
        certifications: ['Immigration Rights Specialist', 'Civil Rights Advocate'],
        firmName: 'Rodriguez Rights Law Group',
        rating: 4.7,
        instagramUrl: 'https://instagram.com/elenarodriguez',
        twitterUrl: 'https://twitter.com/elenarodriguez',
        linkedinUrl: 'https://linkedin.com/in/elenarodriguez'
      },
      {
        email: 'benjamin.washington@example.com',
        name: 'Benjamin Washington',
        password: passwordHash,
        phone: '+1-555-444-9999',
        profileImage: 'https://randomuser.me/api/portraits/men/55.jpg',
        specialization: 'Civil Rights',
        experience: 20,
        barNumber: 'BN99999',
        jurisdictions: ['Federal', 'New York', 'Georgia', 'Alabama'],
        languages: ['English'],
        education: ['Howard University School of Law'],
        certifications: ['Voting Rights Expert', 'Equal Employment Opportunity Specialist'],
        firmName: 'Washington Civil Liberties Firm',
        rating: 4.9,
        instagramUrl: 'https://instagram.com/benjaminwashington',
        twitterUrl: 'https://twitter.com/benjaminwashington',
        linkedinUrl: 'https://linkedin.com/in/benjaminwashington'
      }
    ];

    // Insert each new lawyer
    for (const lawyerData of newLawyers) {
      try {
        // Check if lawyer already exists
        const existingUser = await db.collection('User').findOne({ email: lawyerData.email });
        
        if (existingUser) {
          console.log(`Lawyer with email ${lawyerData.email} already exists. Skipping...`);
          continue;
        }
        
        // Create user
        const now = new Date();
        const user = {
          email: lawyerData.email,
          password: lawyerData.password,
          role: 'lawyer',
          isVerified: true,
          isBlocked: false,
          createdAt: now,
          updatedAt: now
        };
        
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
        
        console.log(`Created new lawyer with social media: ${lawyerData.name}`);
      } catch (error) {
        console.error(`Error creating lawyer ${lawyerData.name}:`, error);
      }
    }
    
    console.log('Social media seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding social media lawyers:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main(); 