import IStorageService from "@/domain/interface/services/IStorageService";
import S3StorageService from "./S3StorageService";
import { S3_BUCKET_NAME } from "@/config/env";
import CustomError from "@/domain/entities/CustomError";
import { StatusCode } from "@/types";

export default class S3StorageAdapter implements IStorageService {
   constructor(private s3Service: S3StorageService) {
      if (!S3_BUCKET_NAME) {
         throw new CustomError(
            "S3 bucket name is not defined in environment variables",
            StatusCode.InternalServerError
         );
      }
   }

   async createPreSignedUrl(key: string): Promise<string> {
      return this.s3Service.generatePreSignedUrl(S3_BUCKET_NAME!, key, 3600); // 1 hour expiry
   }

   async deleteObject(key: string): Promise<void> {
      await this.s3Service.deleteFile(S3_BUCKET_NAME!, key);
   }
}
