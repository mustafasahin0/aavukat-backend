import IMessageRepository from "@/domain/interface/repositories/IMessageRepository";
import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import IChatRepository from "@/domain/interface/repositories/IChatRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import CustomError from "@/domain/entities/CustomError";
import IMessage from "@/domain/entities/IMessage";
import { StatusCode } from "@/types";

export default class CreateChatUseCase {
   constructor(
      private messageRepository: IMessageRepository,
      private chatRepository: IChatRepository,
      private validatorService: IValidatorService,
      private clientRepository: IClientRepository,
      private lawyerRepository: ILawyerRepository
   ) {}
   async createChat(lawyerId: string, clientId: string): Promise<string> {
      this.validatorService.validateRequiredFields({ lawyerId, clientId });
      this.validatorService.validateIdFormat(lawyerId);
      this.validatorService.validateIdFormat(clientId);
      const client = await this.clientRepository.findById(clientId);
      const lawyer = await this.lawyerRepository.findById(lawyerId);
      if (!client) {
         throw new CustomError("Invalid client id", StatusCode.NotFound);
      } else if (!lawyer) {
         throw new CustomError("Invalid lawyer id", StatusCode.NotFound);
      }
      if (!client.profile || !client.name) {
         throw new CustomError("Client profile or name is missing", StatusCode.BadRequest);
      }
      try {
         const chat = await this.chatRepository.create({
            lawyerId,
            clientId,
            clientName: client.name,
            lawyerName: lawyer.name,
            clientProfile: client.profile,
            lawyerProfile: lawyer.profileImage,
         });
         return chat._id!;
      } catch (error: any) {
         if (error.code === 11000) {
            const chat = await this.chatRepository.findByLawyerAndClientId(lawyerId, clientId);
            return chat?._id!;
         }
         throw error;
      }
   }
   async createMessage(chatId: string, receiverId: string, message: string, senderId: string): Promise<IMessage> {
      this.validatorService.validateRequiredFields({ chatId, receiverId, message, senderId });
      this.validatorService.validateMultipleIds([chatId, receiverId, senderId]);
      // updating for sorting based on latest message
      await this.chatRepository.update(chatId, { updatedAt: new Date() });
      return await this.messageRepository.create({ chatId, message, receiverId, senderId, isReceived: false });
   }
}
