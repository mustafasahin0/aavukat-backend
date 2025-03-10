import IMessageRepository from "@/domain/interface/repositories/IMessageRepository";
import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import IChatRepository from "@/domain/interface/repositories/IChatRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import CustomError from "@/domain/entities/CustomError";
import IMessage from "@/domain/entities/IMessage";
import IClient from "@/domain/entities/IClient";
import IChat from "@/domain/entities/IChat";
import { StatusCode } from "@/types";

export default class GetChatUseCase {
   constructor(
      private messageRepository: IMessageRepository,
      private chatRepository: IChatRepository,
      private validatorService: IValidatorService,
      private clientRepository: IClientRepository
   ) {}

   async isAuthorizedInChat(chatId: string, userId: string): Promise<boolean> {
      this.validatorService.validateIdFormat(chatId);
      const chat = await this.chatRepository.findById(chatId);
      if (!chat) {
         return false;
      } else if (chat.lawyerId?.toString() === userId) {
         return true;
      } else if (chat.clientId?.toString() === userId) {
         return true;
      } else {
         return false;
      }
   }

   async getAllChatsWithClientId(clientId: string): Promise<IChat[] | []> {
      this.validatorService.validateIdFormat(clientId);
      const chats = await this.chatRepository.findAllChatsForClient(clientId);
      return await this.getChatsWithNotSeenMessages(clientId, chats);
   }

   async getAllChatsWithLawyerId(lawyerId: string): Promise<IChat[] | []> {
      this.validatorService.validateIdFormat(lawyerId);
      const chats = await this.chatRepository.findAllChatsForLawyer(lawyerId);
      return await this.getChatsWithNotSeenMessages(lawyerId, chats);
   }

   async getClientsLawyer(): Promise<IClient[] | []> {
      const clients = await this.clientRepository.findAll();
      if (!clients) return [];
      return clients.filter((client: IClient) => client.profile && client.name);
   }

   async getMessagesOfChat(chatId: string): Promise<{ messages: IMessage[] | []; chat: IChat }> {
      this.validatorService.validateIdFormat(chatId);
      const chat = await this.chatRepository.findById(chatId);
      if (!chat) throw new CustomError("Not found", StatusCode.NotFound);
      const messages = await this.messageRepository.findByChatId(chatId);
      return { messages, chat };
   }

   async markReceived(chatId: string, receiverId: string): Promise<void> {
      this.validatorService.validateMultipleIds([receiverId, chatId]);
      await this.messageRepository.markAsReadByReceiverAndChatId(receiverId, chatId);
   }

   private async getChatsWithNotSeenMessages(receiverId: string, chats: IChat[]): Promise<IChat[] | []> {
      const unreadMessages = await this.messageRepository.getUnreadMessageCountGroupedByChat(receiverId);
      if (unreadMessages.length === 0) return chats.map((chat) => ({ ...chat, notSeenMessages: 0 }));

      const map = new Map<string, number>();
      unreadMessages.forEach(({ _id, count }) => {
         map.set(_id.toString(), count);
      });
      const result = chats.map((chat) => ({
         ...chat,
         notSeenMessages: map.get(chat._id?.toString()!) || 0,
      }));
      return result;
   }
}
