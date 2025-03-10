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
}
