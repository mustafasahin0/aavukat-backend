import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import IStorageService from "@/domain/interface/services/IStorageService";
import IClient from "@/domain/entities/IClient";

export default class ClientUseCases {
   constructor(
      private clientRepository: IClientRepository,
      private storageService: IStorageService
   ) {}

   async getUserProfile(id: string): Promise<IClient> {
      const client = await this.clientRepository.findById(id);
      if (!client) {
         throw new Error("Client not found");
      }
      return client;
   }

   async updateProfile(id: string, data: Partial<IClient>): Promise<void> {
      await this.clientRepository.updateById(id, data);
   }

   async createPreSignedUrl(id: string): Promise<{ url: string; key: string }> {
      const key = `profile-images/client/${id}/${Date.now()}`;
      const url = await this.storageService.createPreSignedUrl(key);
      return { url, key };
   }

   async updateProfileImage(id: string, key: string): Promise<void> {
      await this.clientRepository.updateById(id, { profileImage: key });
   }
}
