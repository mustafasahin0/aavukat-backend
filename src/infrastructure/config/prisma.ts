import { PrismaClient } from "@prisma/client";
import { encodeMongoURI } from "../../../prisma/mongodb-utils";

// Ensure properly encoded MongoDB connection string
if (process.env.DATABASE_URL) {
   process.env.DATABASE_URL = encodeMongoURI(process.env.DATABASE_URL);
}

const prisma = new PrismaClient({
   log: ["query", "info", "warn", "error"],
});

export default prisma;
