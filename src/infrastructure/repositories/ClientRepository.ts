import IClient from "@/domain/entities/IClient";
import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import { ClientModel } from "../model/ClientModel";
import { PaginatedResult } from "@/types";

export default class ClientRepository implements IClientRepository {
   async create(client: IClient): Promise<IClient> {
      const newClient = await ClientModel.create(client);
      return newClient.toObject();
   }

   async findByEmail(email: string): Promise<IClient | null> {
      const client = await ClientModel.findOne({ email });
      return client ? client.toObject() : null;
   }

   async findByEmailWithCredentials(email: string): Promise<IClient | null> {
      const client = await ClientModel.findOne({ email }).select("+password");
      return client ? client.toObject() : null;
   }

   async findById(id: string): Promise<IClient | null> {
      const client = await ClientModel.findById(id);
      return client ? client.toObject() : null;
   }

   async findMany(
      offset: number,
      limit: number,
      isVerified?: boolean,
      isBlocked?: boolean
   ): Promise<PaginatedResult<IClient>> {
      const filter: any = {};
      if (typeof isVerified === "boolean") filter.isVerified = isVerified;
      if (typeof isBlocked === "boolean") filter.isBlocked = isBlocked;

      const [items, totalItems] = await Promise.all([
         ClientModel.find(filter).skip(offset).limit(limit).lean(),
         ClientModel.countDocuments(filter),
      ]);

      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalItems / limit);
      const hasNextPage = currentPage < totalPages;
      const hasPreviousPage = currentPage > 1;

      return {
         items,
         totalItems,
         currentPage,
         totalPages,
         hasNextPage,
         hasPreviousPage,
      };
   }

   async findManyByLawyerId(lawyerId: string, offset: number, limit: number): Promise<PaginatedResult<IClient>> {
      const [items, totalItems] = await Promise.all([
         ClientModel.find({ lawyerId }).skip(offset).limit(limit).lean(),
         ClientModel.countDocuments({ lawyerId }),
      ]);

      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalItems / limit);
      const hasNextPage = currentPage < totalPages;
      const hasPreviousPage = currentPage > 1;

      return {
         items,
         totalItems,
         currentPage,
         totalPages,
         hasNextPage,
         hasPreviousPage,
      };
   }

   async markAsVerified(email: string): Promise<void> {
      await ClientModel.updateOne({ email }, { isVerified: true });
   }

   async saveOtp(email: string, otp: number): Promise<void> {
      await ClientModel.findOneAndUpdate({ email }, { otp });
   }

   async getOtp(email: string): Promise<number | null> {
      const client = await ClientModel.findOne({ email }).select("otp");
      return client?.otp || null;
   }

   async update(id: string, client: IClient): Promise<IClient | null> {
      const updatedClient = await ClientModel.findByIdAndUpdate(id, client, { new: true });
      return updatedClient ? updatedClient.toObject() : null;
   }

   async updateById(id: string, data: Partial<IClient>): Promise<void> {
      await ClientModel.findByIdAndUpdate(id, { $set: data });
   }

   async updatePassword(email: string, password: string): Promise<void> {
      await ClientModel.updateOne({ email }, { password });
   }

   async updateProfile(id: string, data: Partial<IClient>): Promise<IClient | null> {
      const client = await ClientModel.findByIdAndUpdate(id, data, { new: true });
      return client ? client.toObject() : null;
   }

   async deleteById(id: string): Promise<void> {
      await ClientModel.findByIdAndDelete(id);
   }

   async findAll(): Promise<IClient[]> {
      const clients = await ClientModel.find().lean();
      return clients;
   }

   async findClientGenders(): Promise<{ gender: string; count: number }[]> {
      const genderStats = await ClientModel.aggregate([
         {
            $group: {
               _id: "$gender",
               count: { $sum: 1 },
            },
         },
         {
            $project: {
               _id: 0,
               gender: { $ifNull: ["$_id", "others"] },
               count: 1,
            },
         },
      ]);

      return genderStats;
   }

   async getCountInTimeRange(startTime: Date, endTime: Date): Promise<number> {
      const count = await ClientModel.countDocuments({
         createdAt: {
            $gte: startTime,
            $lte: endTime,
         },
      });
      return count;
   }
}
