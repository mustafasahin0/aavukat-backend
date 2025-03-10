import { NextFunction, Request, Response } from "express";
import AdminLawyerUseCase from "@/use_case/admin/AdminLawyerUseCase";
import { LawyersFilter, StatusCode, CustomRequest } from "@/types";
import ILawyer from "@/domain/entities/ILawyer";

export default class AdminLawyerController {
   constructor(private adminLawyerUseCase: AdminLawyerUseCase) {}

   async getLawyers(req: Request, res: Response, next: NextFunction) {
      try {
         let offset = +(req.query.offset as string);
         let limit = +(req.query.limit as string);
         const type = req.query.type as LawyersFilter;

         offset = isNaN(offset) || offset < 0 ? 0 : offset;
         limit = isNaN(limit) || limit < 0 ? 10 : Math.min(limit, 100);

         const validTypes = [LawyersFilter.BLOCKED, LawyersFilter.VERIFIED, LawyersFilter.NOT_VERIFIED];
         const filterType = validTypes.includes(type) ? type : undefined;

         const lawyers = await this.adminLawyerUseCase.getAll(offset, limit, filterType);
         res.status(StatusCode.OK).json(lawyers);
      } catch (error) {
         next(error);
      }
   }

   async verifyLawyer(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.params.id;
         if (!lawyerId) return res.status(StatusCode.BadRequest).json({ message: "Lawyer ID is Required" });

         await this.adminLawyerUseCase.verifyLawyer(lawyerId);
         res.status(StatusCode.OK).json({ message: "Lawyer has been verified" });
      } catch (error) {
         next(error);
      }
   }

   async blockLawyer(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.params.id;
         if (!lawyerId) return res.status(StatusCode.BadRequest).json({ message: "Lawyer ID is Required" });

         await this.adminLawyerUseCase.blockLawyer(lawyerId);
         res.status(StatusCode.OK).json({ message: "Lawyer has been blocked" });
      } catch (error) {
         next(error);
      }
   }

   async unblockLawyer(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.params.id;
         if (!lawyerId) return res.status(StatusCode.BadRequest).json({ message: "Lawyer ID is Required" });

         await this.adminLawyerUseCase.unblockLawyer(lawyerId);
         res.status(StatusCode.OK).json({ message: "Lawyer has been unblocked" });
      } catch (error) {
         next(error);
      }
   }
}
