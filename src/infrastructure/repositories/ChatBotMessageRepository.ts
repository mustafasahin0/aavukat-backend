import IChatBotMessage from "@/domain/entities/IChatBotMessage";
import IChatBotMessageRepository from "@/domain/interface/repositories/IChatBotMessageRepository";
import ChatBotMessageModel from "../model/ChatBotMessageModel";

export default class ChatBotMessageRepository implements IChatBotMessageRepository {
   model = ChatBotMessageModel;

   async create(message: IChatBotMessage): Promise<IChatBotMessage> {
      return await this.model.create(message);
   }

   async findById(id: string): Promise<IChatBotMessage | null> {
      return await this.model.findById(id);
   }

   async update(id: string, message: IChatBotMessage): Promise<IChatBotMessage | null> {
      return await this.model.findByIdAndUpdate(id, message);
   }

   async getMessagesByClientId(clientId: string, limit: number): Promise<IChatBotMessage[]> {
      return await this.model.find({ clientId }).sort({ createdAt: -1 }).limit(limit).lean(true);
   }

   async deleteNotInId(ids: string[]): Promise<void> {
      await this.model.deleteMany({ _id: { $nin: ids } });
   }
}
