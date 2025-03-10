import { PaginatedResult } from "@/types";
import IClient from "@/domain/entities/IClient";
import IRepository from "./IRepository";

export default interface IClientRepository extends IRepository<IClient> {
   findById(id: string): Promise<IClient | null>;
   findByEmail(email: string): Promise<IClient | null>;
   findByEmailWithCredentials(email: string): Promise<IClient | null>;
   findManyByLawyerId(lawyerId: string, offset: number, limit: number): Promise<PaginatedResult<IClient>>;
   findMany(
      offset: number,
      limit: number,
      isVerified?: boolean,
      isBlocked?: boolean
   ): Promise<PaginatedResult<IClient>>;
   create(client: IClient): Promise<IClient>;
   update(id: string, client: IClient): Promise<IClient | null>;
   updateById(id: string, data: Partial<IClient>): Promise<void>;
   deleteById(id: string): Promise<void>;
   findAll(): Promise<IClient[]>;
   findClientGenders(): Promise<{ gender: string; count: number }[]>;
   getCountInTimeRange(startTime: Date, endTime: Date): Promise<number>;
   saveOtp(email: string, otp: number): Promise<void>;
   getOtp(email: string): Promise<number | null>;
   markAsVerified(email: string): Promise<void>;
   updatePassword(email: string, hashedPassword: string): Promise<void>;
}
