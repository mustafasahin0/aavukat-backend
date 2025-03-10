import { NextFunction, Response } from "express";
import { CustomRequest, StatusCode } from "@/types";
import ChatBotUseCase from "@/use_case/chatbot/ChatBotUseCase";

export default class ChatBotController {
   constructor(private chatBotUseCase: ChatBotUseCase) {}

   async createMessage(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const clientId = req.client?.id;
         const message = req.body.message;
         const messages = await this.chatBotUseCase.createMessage(clientId!, message);
         res.status(StatusCode.Created).json(messages);
      } catch (error) {
         next(error);
      }
   }

   async getMessages(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const clientId = req.client?.id;
         const messages = await this.chatBotUseCase.getMessages(clientId!);
         res.status(StatusCode.OK).json(messages);
      } catch (error) {
         next(error);
      }
   }
}
