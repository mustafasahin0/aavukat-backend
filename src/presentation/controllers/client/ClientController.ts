import { Request, Response } from "express";
import { CustomRequest, StatusCode } from "@/types";
import ClientUseCases from "@/use_case/client/ClientUseCases";

export default class ClientController {
   constructor(private clientUseCases: ClientUseCases) {}

   async getProfile(req: CustomRequest, res: Response) {
      try {
         const { id } = req.client!;
         const profile = await this.clientUseCases.getUserProfile(id);
         return res.status(StatusCode.OK).json(profile);
      } catch (error: any) {
         return res.status(error.statusCode || StatusCode.InternalServerError).json({
            message: error.message || "Failed to fetch profile",
         });
      }
   }

   async updateProfile(req: CustomRequest, res: Response) {
      try {
         const { id } = req.client!;
         await this.clientUseCases.updateProfile(id, req.body);
         return res.status(StatusCode.OK).json({ message: "Profile updated successfully" });
      } catch (error: any) {
         return res.status(error.statusCode || StatusCode.InternalServerError).json({
            message: error.message || "Failed to update profile",
         });
      }
   }

   async uploadProfilePicture(req: CustomRequest, res: Response) {
      try {
         const { id } = req.client!;
         const { url, key } = await this.clientUseCases.createPreSignedUrl(id);
         await this.clientUseCases.updateProfileImage(id, key);
         return res.status(StatusCode.OK).json({ url, key });
      } catch (error: any) {
         return res.status(error.statusCode || StatusCode.InternalServerError).json({
            message: error.message || "Failed to upload profile picture",
         });
      }
   }
}
