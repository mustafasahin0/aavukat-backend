import { NextFunction, Request, Response } from "express";
import AdminClientUseCase from "@/use_case/admin/AdminClientUseCase";
import { CustomRequest, StatusCode } from "@/types";

export default class AdminClientController {
   constructor(private adminClientUseCase: AdminClientUseCase) {}

   async getClients(req: Request, res: Response, next: NextFunction) {
      try {
         const offset = +(req.query.offset as string) || 0;
         const limit = +(req.query.limit as string) || 10;

         const clients = await this.adminClientUseCase.getAll(offset, limit);
         res.status(StatusCode.OK).json(clients);
      } catch (error) {
         next(error);
      }
   }

   async updateClient(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const clientId = req.params.clientId;
         const isBlocked = req.path.endsWith("/block");

         if (!clientId?.trim()) {
            return res.status(StatusCode.BadRequest).json({ message: "Client ID is required" });
         }

         await this.adminClientUseCase.blockUnblock(clientId, isBlocked, req.admin?.email!);

         res.status(StatusCode.OK).json({
            message: `Client ${isBlocked ? "Blocked" : "Unblocked"} Successfully`,
         });
      } catch (error) {
         next(error);
      }
   }
}
