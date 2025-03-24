import cors from "cors";
import helmet from "helmet";
import express from "express";
import logger from "./utils/logger";
import { createServer } from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { CLIENT_URL, PORT } from "./config/env";
import { connectDB } from "./config/connectDB";
import routes from "./presentation/routers/index";
import initializeSocketIO from "./presentation/socket";
import { webhook } from "./presentation/routers/appointment/AppointmentRoutes";
import { errorHandler } from "./presentation/di/middlewares";
import { prisma } from "./config/prisma";
import fs from 'fs';
import path from 'path';

const port = PORT || 8080;

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(
   cors({
      origin: CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
      credentials: true,
      exposedHeaders: ["set-cookie"],
      maxAge: 86400, // 24 hours
   })
);
app.post("/api/webhook", bodyParser.raw({ type: "application/json" }), webhook);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);

// Register global error handler as the last middleware
app.use(errorHandler.exec.bind(errorHandler));

// Initialize Certificate and DB Connections
const initApp = async () => {
  try {
    // First ensure the certificate exists for DocumentDB
    const certPath = path.resolve(process.cwd(), 'global-bundle.pem');
    
    // Connect MongoDB first since it handles certificate download if needed
    await connectDB();
    
    // Test Prisma connection to ensure it's working
    if (process.env.NODE_ENV === 'production') {
      try {
        // Simple operation to verify Prisma connection
        await prisma.$connect();
        logger.info('Prisma connection successful');
      } catch (error) {
        logger.error('Prisma connection failed:', error);
        
        // If certificate exists but Prisma fails, there might be a path issue
        if (fs.existsSync(certPath)) {
          logger.info('Certificate exists at', certPath, 'but Prisma cannot connect');
          // Copy the certificate to additional locations as a fallback
          try {
            const distPath = path.resolve(process.cwd(), 'dist', 'global-bundle.pem');
            fs.copyFileSync(certPath, distPath);
            logger.info(`Copied certificate to ${distPath}`);
          } catch (copyError) {
            logger.error('Failed to copy certificate:', copyError);
          }
        }
      }
    }
    
    // Start the server only after DB connection is verified
    server.listen(port, () => {
      logger.info(`Server started listening on port: ${port}`);
      initializeSocketIO(server);
    });
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initApp();
