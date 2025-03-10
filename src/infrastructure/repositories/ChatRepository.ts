import IChat from "@/domain/entities/IChat";
import IChatRepository from "@/domain/interface/repositories/IChatRepository";
import ChatModel from "../model/ChatModel";

export default class ChatRepository implements IChatRepository {
   model = ChatModel;

   async create(chat: IChat): Promise<IChat> {
      return await this.model.create(chat);
   }

   async findById(id: string): Promise<IChat | null> {
      return await this.model.findById(id);
   }

   async update(id: string, chat: IChat): Promise<IChat | null> {
      return await this.model.findByIdAndUpdate(id, chat, { new: true });
   }

   async findByLawyerIdAndUpdate(lawyerId: string, chat: IChat): Promise<void> {
      await this.model.findOneAndUpdate({ lawyerId }, { $set: chat }, { new: true });
   }

   async findByClientIdAndUpdate(clientId: string, chat: IChat): Promise<void> {
      await this.model.findOneAndUpdate({ clientId }, { $set: chat }, { new: true });
   }

   async findAllChatsForClient(clientId: string): Promise<IChat[]> {
      return await this.model.find({ clientId }).sort({ updatedAt: -1 }).lean(true);
   }

   async findAllChatsForLawyer(lawyerId: string): Promise<IChat[]> {
      return await this.model.find({ lawyerId }).sort({ updatedAt: -1 }).lean(true);
   }

   async findByLawyerAndClientId(lawyerId: string, clientId: string): Promise<IChat | null> {
      return await this.model.findOne({ lawyerId, clientId });
   }
}
