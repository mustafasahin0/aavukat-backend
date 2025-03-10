import IChat from "../../entities/IChat";
import IRepository from "./IRepository";

export default interface IChatRepository extends IRepository<IChat> {
   findAllChatsForClient(clientId: string): Promise<IChat[]>;
   findAllChatsForLawyer(lawyerId: string): Promise<IChat[]>;
   findByLawyerIdAndUpdate(lawyerId: string, chat: IChat): Promise<void>;
   findByClientIdAndUpdate(clientId: string, chat: IChat): Promise<void>;
   findByLawyerAndClientId(lawyerId: string, clientId: string): Promise<IChat | null>;
}
