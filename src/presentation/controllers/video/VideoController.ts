import { NextFunction, Response } from "express";
import GetVideoSectionUseCase from "@/use_case/video/GetVideoSectionUseCase";
import { CustomRequest, StatusCode } from "@/types";

export default class VideoController {
   constructor(private getVideoSectionUseCase: GetVideoSectionUseCase) {}

   async getSectionsInOneDayLawyer(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.lawyer?.id;
         const sections = await this.getVideoSectionUseCase.getSectionInOneDayLawyer(lawyerId!);
         res.status(StatusCode.OK).json(sections);
      } catch (error) {}
   }

   async getSectionsInOneDayClient(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const clientId = req.client?.id;
         const sections = await this.getVideoSectionUseCase.getSectionsInOneDayClient(clientId!);
         res.status(StatusCode.OK).json(sections);
      } catch (error) {
         next(error);
      }
   }

   async getAllSectionsLawyer(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.lawyer?.id;
         const sections = await this.getVideoSectionUseCase.getSectionsByLawyerId(lawyerId!);
         res.status(StatusCode.OK).json(sections);
      } catch (error) {
         next(error);
      }
   }

   async getSectionById(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const sectionId = req.params.sectionId as string;
         const section = await this.getVideoSectionUseCase.getSectionById(sectionId);
         res.status(StatusCode.OK).json({ section });
      } catch (error) {
         next(error);
      }
   }
}
