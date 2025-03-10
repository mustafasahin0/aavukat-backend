import { PaginatedResult } from "@/types";
import ILegalHistory from "@/domain/entities/ILegalHistory";
import ILegalHistoryRepository from "@/domain/interface/repositories/ILegalHistoryRepository";
import prisma from "@/infrastructure/config/prisma";

export default class LegalHistoryRepository implements ILegalHistoryRepository {
   async findById(id: string): Promise<ILegalHistory | null> {
      return prisma.legalHistory.findUnique({
         where: { id },
      });
   }

   async findManyByClientId(clientId: string, offset: number, limit: number): Promise<PaginatedResult<ILegalHistory>> {
      const [items, totalItems] = await Promise.all([
         prisma.legalHistory.findMany({
            where: { clientId },
            skip: offset,
            take: limit,
            orderBy: { createdAt: "desc" },
         }),
         prisma.legalHistory.count({
            where: { clientId },
         }),
      ]);

      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalItems / limit);

      return {
         items,
         totalItems,
         currentPage,
         totalPages,
         hasNextPage: currentPage < totalPages,
         hasPreviousPage: currentPage > 1,
      };
   }

   async findManyByLawyerId(lawyerId: string, offset: number, limit: number): Promise<PaginatedResult<ILegalHistory>> {
      const [items, totalItems] = await Promise.all([
         prisma.legalHistory.findMany({
            where: { lawyerId },
            skip: offset,
            take: limit,
            orderBy: { createdAt: "desc" },
         }),
         prisma.legalHistory.count({
            where: { lawyerId },
         }),
      ]);

      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalItems / limit);

      return {
         items,
         totalItems,
         currentPage,
         totalPages,
         hasNextPage: currentPage < totalPages,
         hasPreviousPage: currentPage > 1,
      };
   }

   async create(history: ILegalHistory): Promise<ILegalHistory> {
      return prisma.legalHistory.create({
         data: history,
      });
   }

   async update(id: string, history: ILegalHistory): Promise<ILegalHistory | null> {
      return await prisma.legalHistory.update({
         where: { id },
         data: history,
      });
   }

   async deleteById(id: string): Promise<void> {
      await prisma.legalHistory.delete({
         where: { id },
      });
   }
}
