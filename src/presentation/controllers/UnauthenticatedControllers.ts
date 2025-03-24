import { StatusCode } from "@/types";
import UnauthenticatedUseCases from "@/use_case/UnauthenticatedUseCases";
import { NextFunction, Request, Response } from "express";

export default class UnauthenticatedControllers {
   constructor(private unauthenticatedUseCase: UnauthenticatedUseCases) {}

   async getLawyers(req: Request, res: Response, next: NextFunction) {
      try {
         const highestRank = req.query.highestRank === 'true';
         const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
         const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;
         
         // Validate limit if provided
         if (limit !== undefined && (isNaN(limit) || limit < 1)) {
            return res.status(StatusCode.BadRequest).json({ message: "Limit must be a positive number" });
         }
         
         // Validate offset if provided
         if (offset !== undefined && (isNaN(offset) || offset < 0)) {
            return res.status(StatusCode.BadRequest).json({ message: "Offset must be a non-negative number" });
         }
         
         const lawyers = await this.unauthenticatedUseCase.getLawyers({ highestRank, limit, offset });
         res.status(StatusCode.OK).json(lawyers);
      } catch (error) {
         next(error);
      }
   }

   async getLawyerById(req: Request, res: Response, next: NextFunction) {
      try {
         const { id } = req.params;
         
         if (!id) {
            return res.status(StatusCode.BadRequest).json({ message: "Lawyer ID is required" });
         }
         
         const lawyer = await this.unauthenticatedUseCase.getLawyerById(id);
         
         if (!lawyer) {
            return res.status(StatusCode.NotFound).json({ message: "Lawyer not found" });
         }
         
         res.status(StatusCode.OK).json(lawyer);
      } catch (error) {
         next(error);
      }
   }

   async healthCheck(req: Request, res: Response, next: NextFunction) {
      try {
         // You can add more sophisticated checks here later if needed
         const health = {
            status: 'ok',
            timestamp: new Date(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime()
         };
         
         res.status(StatusCode.OK).json(health);
      } catch (error) {
         next(error);
      }
   }
}
