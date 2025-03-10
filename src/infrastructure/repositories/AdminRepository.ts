import { IAdmin } from "@/domain/base/BaseAuthenticationUseCase";
import IAdminRepository from "@/domain/interface/repositories/IAdminRepository";
import { UserRole } from "@/types";
import { PrismaClient } from "@prisma/client";

export default class AdminRepository implements IAdminRepository {
   constructor(private prisma: PrismaClient) {}

   async findById(id: string): Promise<IAdmin | null> {
      const admin = await this.prisma.user.findUnique({
         where: { id, role: UserRole.Admin },
      });
      return admin ? this.toAdmin(admin) : null;
   }

   async findByEmail(email: string): Promise<IAdmin | null> {
      const admin = await this.prisma.user.findUnique({
         where: { email, role: UserRole.Admin },
      });
      return admin ? this.toAdmin(admin) : null;
   }

   async findByEmailWithCredentials(email: string): Promise<IAdmin | null> {
      const admin = await this.prisma.user.findUnique({
         where: { email, role: UserRole.Admin },
      });
      return admin ? this.toAdmin(admin) : null;
   }

   async create(admin: IAdmin): Promise<IAdmin> {
      const created = await this.prisma.user.create({
         data: {
            email: admin.email,
            password: admin.password || "",
            role: UserRole.Admin,
            isVerified: true,
         },
      });
      return this.toAdmin(created);
   }

   async update(id: string, admin: IAdmin): Promise<void> {
      await this.prisma.user.update({
         where: { id },
         data: {
            isBlocked: admin.isBlocked,
            password: admin.password,
         },
      });
   }

   private toAdmin(data: any): IAdmin {
      return {
         _id: data.id,
         email: data.email,
         name: data.name,
         isBlocked: data.isBlocked,
         isVerified: data.isVerified,
         role: data.role,
         password: data.password,
      };
   }
}
