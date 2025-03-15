import { connect } from "mongoose";
import { MONGODB_URL } from "./env";

export const connectDB = async () => {
   try {
      // Prefer DATABASE_URL over MONGODB_URL for DocumentDB support
      const connectionString = process.env.DATABASE_URL || MONGODB_URL;
      
      console.log(`Connecting to database at ${connectionString?.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`);
      
      // Check if using DocumentDB (contains tlsCAFile parameter)
      if (connectionString?.includes('tlsCAFile')) {
         // For DocumentDB connection
         await connect(connectionString);
      } else {
         // For standard MongoDB connection
         await connect(connectionString || "");
      }
      
      console.log("Successfully connected to database");
   } catch (error) {
      console.log("Error in Connecting MongoDB ", error);
   }
};
