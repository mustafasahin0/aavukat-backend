import { Request, Response } from "express";
import { CustomRequest, StatusCode } from "@/types";
import GetClientUseCase from "@/use_case/lawyer/GetClientUseCase";

export default class LawyerController {
   constructor(private getClientUseCase: GetClientUseCase) {}

   async getClients(req: CustomRequest, res: Response) {
      try {
         const { id: lawyerId } = req.lawyer!;
         const { limit = 10, offset = 0 } = req.query;

         const clients = await this.getClientUseCase.execute(lawyerId, Number(limit), Number(offset));

         return res.status(StatusCode.OK).json(clients);
      } catch (error: any) {
         return res.status(error.statusCode || StatusCode.InternalServerError).json({
            message: error.message || "Failed to fetch clients",
         });
      }
   }

   async getClientLegalHistory(req: Request, res: Response) {
      try {
         const { clientId } = req.params;
         const { limit = 10, offset = 0 } = req.query;

         const history = await this.getClientUseCase.getLegalHistory(clientId, Number(offset), Number(limit));

         return res.status(StatusCode.OK).json(history);
      } catch (error: any) {
         return res.status(error.statusCode || StatusCode.InternalServerError).json({
            message: error.message || "Failed to fetch legal history",
         });
      }
   }
}
