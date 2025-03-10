import IChatBotMessage from "@/domain/entities/IChatBotMessage";
import IChatBotMessageRepository from "@/domain/interface/repositories/IChatBotMessageRepository";
import IChatBotService from "@/domain/interface/services/IChatBotService";
import IValidatorService from "@/domain/interface/services/IValidatorService";

export default class ChatBotUseCase {
   constructor(
      private chatBotMessageRepository: IChatBotMessageRepository,
      private chatBotService: IChatBotService,
      private validatorService: IValidatorService
   ) {}

   async createMessage(clientId: string, clientMessage: string): Promise<IChatBotMessage[]> {
      this.validatorService.validateRequiredFields({ clientMessage, clientId });
      this.validatorService.validateIdFormat(clientId);
      const botResponse = await this.chatBotService.generateResponse(clientMessage);
      await this.chatBotMessageRepository.create({ clientId, message: clientMessage, isBotMessage: false });
      const botMessage = await this.chatBotMessageRepository.create({
         clientId,
         message: botResponse,
         isBotMessage: true,
      });
      return [botMessage];
   }

   async getMessages(clientId: string): Promise<IChatBotMessage[]> {
      this.validatorService.validateIdFormat(clientId);
      const limit = 40;
      const messages = await this.chatBotMessageRepository.getMessagesByClientId(clientId, limit);
      if (messages.length > limit) {
         const ids = messages.map((message: IChatBotMessage) => message._id!);
         await this.chatBotMessageRepository.deleteNotInId(ids);
      }
      return messages;
   }
}
