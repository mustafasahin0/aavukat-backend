import IChatBotMessage from "../../entities/IChatBotMessage";
import IRepository from "./IRepository";

export default interface IChatBotMessageRepository extends IRepository<IChatBotMessage> {
   getMessagesByClientId(clientId: string, limit: number): Promise<IChatBotMessage[] | []>;
   deleteNotInId(ids: string[]): Promise<void>;
}
