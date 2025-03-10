import { PaginatedResult } from "@/types";
import ILawyer from "@/domain/entities/ILawyer";
import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import prisma from "@/infrastructure/config/prisma";

export default class LawyerRepository implements ILawyerRepository {
   async findByEmail(email: string): Promise<ILawyer | null> {
      const result = await prisma.lawyer.findFirst({
         where: {
            user: {
               email,
            },
         },
         include: {
            user: true,
         },
      });

      if (!result) return null;

      return this.mapToILawyer(result);
   }

   async findByEmailWithCredentials(email: string): Promise<ILawyer | null> {
      const result = await prisma.lawyer.findFirst({
         where: {
            user: {
               email,
            },
         },
         include: {
            user: true,
         },
      });

      if (!result) return null;

      return this.mapToILawyer(result);
   }

   async findById(id: string): Promise<ILawyer | null> {
      const result = await prisma.lawyer.findUnique({
         where: { id },
         include: {
            user: true,
         },
      });

      if (!result) return null;

      return this.mapToILawyer(result);
   }

   async findMany(
      offset: number,
      limit: number,
      isVerified?: boolean,
      isBlocked?: boolean
   ): Promise<PaginatedResult<ILawyer>> {
      const [results, totalItems] = await Promise.all([
         prisma.lawyer.findMany({
            skip: offset,
            take: limit,
            orderBy: { user: { createdAt: "desc" } },
            include: {
               user: true,
            },
         }),
         prisma.lawyer.count(),
      ]);

      const items = results.map((result: any) => this.mapToILawyer(result));
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

   async create(lawyer: ILawyer): Promise<ILawyer> {
      const result = await prisma.lawyer.create({
         data: {
            name: lawyer.name || "",
            specialization: lawyer.specialization || "",
            experience: lawyer.experience || 0,
            rating: 0,
            user: {
               create: {
                  email: lawyer.email || "",
                  password: lawyer.password || "",
                  role: lawyer.role || "lawyer",
               },
            },
         },
         include: {
            user: true,
         },
      });

      return this.mapToILawyer(result);
   }

   async update(id: string, lawyer: Partial<ILawyer>): Promise<void> {
      await prisma.lawyer.update({
         where: { id },
         data: {
            name: lawyer.name,
            specialization: lawyer.specialization,
            experience: lawyer.experience,
            user:
               lawyer.email || lawyer.password || lawyer.role
                  ? {
                       update: {
                          email: lawyer.email,
                          password: lawyer.password,
                          role: lawyer.role,
                       },
                    }
                  : undefined,
         },
      });
   }

   async updateById(id: string, data: Partial<ILawyer>): Promise<void> {
      await this.update(id, data);
   }

   async deleteById(id: string): Promise<void> {
      await prisma.lawyer.delete({
         where: { id },
      });
   }

   async getCountInTimeRange(startTime: Date, endTime: Date): Promise<number> {
      const count = await prisma.lawyer.count({
         where: {
            user: {
               createdAt: {
                  gte: startTime,
                  lte: endTime,
               },
            },
         },
      });
      return count;
   }

   private mapToILawyer(lawyer: any): ILawyer {
      return {
         _id: lawyer.id,
         name: lawyer.name || "",
         email: lawyer.user?.email,
         role: lawyer.user?.role,
         specialization: lawyer.specialization,
         experience: lawyer.experience,
         isVerified: lawyer.user?.isVerified || false,
         isBlocked: lawyer.user?.isBlocked || false,
         createdAt: lawyer.user?.createdAt,
         updatedAt: lawyer.user?.updatedAt,
      };
   }
}
