import ILegalHistory from "../../entities/ILegalHistory";
import { PaginatedResult } from "@/types";
import IRepository from "./IRepository";

export default interface ILegalHistoryRepository extends IRepository<ILegalHistory> {
   findManyByClientId(clientId: string, offset: number, limit: number): Promise<PaginatedResult<ILegalHistory>>;
   findManyByLawyerId(lawyerId: string, offset: number, limit: number): Promise<PaginatedResult<ILegalHistory>>;
}
