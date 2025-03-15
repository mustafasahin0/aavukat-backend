import { StatusCode } from "@/types";
import UnauthenticatedUseCases from "@/use_case/UnauthenticatedUseCases";
import { NextFunction, Request, Response } from "express";

export default class UnauthenticatedControllers {
   constructor(private unauthenticatedUseCase: UnauthenticatedUseCases) {}

   async getLawyers(req: Request, res: Response, next: NextFunction) {
      try {
         res.status(StatusCode.OK).json(await this.unauthenticatedUseCase.getLawyers());
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
