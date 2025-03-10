import { IPasswordServiceRepository } from "@/domain/interface/services/IPasswordServiceRepository";
import ICloudStorageService from "@/domain/interface/services/ICloudStorageService";
import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import IOtpRepository from "@/domain/interface/repositories/IOtpRepository";
import IEmailService from "@/domain/interface/services/IEmailService";
import ITokenService from "@/domain/interface/services/ITokenService";
import { AWS_REGION, CLIENT_URL, S3_BUCKET_NAME } from "@/config/env";
import CustomError from "@/domain/entities/CustomError";
import ILawyer from "@/domain/entities/ILawyer";
import { StatusCode, UserRole } from "@/types";
import BaseAuthenticationUseCase, { IAuthResponse, IValidationConfig } from "@/domain/base/BaseAuthenticationUseCase";

export default class LawyerAuthenticationUseCase extends BaseAuthenticationUseCase<ILawyer> {
   private static readonly DEFAULT_VALIDATION_CONFIG: IValidationConfig = {
      phoneRequired: true,
      requiredFields: ["email", "password", "name", "qualifications"],
   };

   constructor(
      private lawyerRepository: ILawyerRepository,
      passwordService: IPasswordServiceRepository,
      tokenService: ITokenService,
      emailService: IEmailService,
      otpRepository: IOtpRepository,
      private cloudService: ICloudStorageService,
      validatorService: IValidatorService
   ) {
      super(passwordService, tokenService, emailService, validatorService, otpRepository, lawyerRepository);
   }

   async login(email: string, password: string): Promise<IAuthResponse> {
      return this.handleAuthFlow(email, password, UserRole.Lawyer, {
         requiredFields: ["email", "password"],
         customValidations: [
            async (user) => {
               if (!user.isVerified) {
                  throw new CustomError("Please verify your email first", StatusCode.Unauthorized);
               }
            },
         ],
      });
   }

   async validateOtpAndLogin(email: string, otp: string): Promise<{ accessToken: string; refreshToken: string }> {
      try {
         const response = await this.handleOtpFlow(email, otp, UserRole.Lawyer);
         if (!response.accessToken || !response.refreshToken) {
            throw new CustomError("Failed to generate tokens", StatusCode.InternalServerError);
         }
         return { accessToken: response.accessToken, refreshToken: response.refreshToken };
      } catch (error) {
         if (error instanceof CustomError) throw error;
         throw new CustomError("OTP validation failed", StatusCode.Unauthorized, undefined, error);
      }
   }

   async resendOtp(email: string, isForVerification: boolean = false): Promise<IAuthResponse> {
      const lawyer = await this.lawyerRepository.findByEmail(email);
      if (!lawyer) throw new CustomError("Lawyer not found", StatusCode.NotFound);

      if (isForVerification && lawyer.isVerified) {
         throw new CustomError("Email is already verified", StatusCode.BadRequest);
      }

      try {
         return await this.handleOtpGeneration(email, lawyer.name || "", {
            type: "verification",
            expiryMinutes: 10,
         });
      } catch (error) {
         throw new CustomError("Failed to send OTP", StatusCode.InternalServerError, undefined, error);
      }
   }

   async register(lawyer: ILawyer): Promise<string> {
      await this.validateRegistrationFields(lawyer, LawyerAuthenticationUseCase.DEFAULT_VALIDATION_CONFIG);

      try {
         lawyer.password = await this.passwordService.hash(lawyer.password!);
         const { _id } = await this.lawyerRepository.create(lawyer);
         return `Lawyer created successfully with ID ${_id}`;
      } catch (error) {
         if (error instanceof Error && error.message.includes("duplicate key")) {
            throw new CustomError("Email already exists", StatusCode.Conflict);
         }
         throw error;
      }
   }

   async getUploadUrl(key: string): Promise<{ url: string; key: string }> {
      try {
         const url = await this.cloudService.generatePreSignedUrl(S3_BUCKET_NAME!, key, 30);
         return { url, key };
      } catch (error) {
         throw new CustomError("Failed to generate upload URL", StatusCode.InternalServerError, undefined, error);
      }
   }

   async updateProfileImage(id: string, key: string): Promise<void> {
      this.validatorService.validateIdFormat(id);
      const lawyer = await this.lawyerRepository.findById(id);
      if (!lawyer) throw new CustomError("Lawyer not found", StatusCode.NotFound);

      try {
         if (lawyer.profileImage) {
            const oldKey = lawyer.profileImage.split("amazonaws.com/").pop()!;
            await this.cloudService.deleteFile(S3_BUCKET_NAME!, oldKey);
         }

         const imageUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
         await this.lawyerRepository.update(id, { ...lawyer, profileImage: imageUrl });
      } catch (error) {
         throw new CustomError("Failed to update profile image", StatusCode.InternalServerError, undefined, error);
      }
   }

   async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
      try {
         const { id, email } = this.tokenService.verifyRefreshToken(refreshToken);
         const user = await this.lawyerRepository.findById(id);
         if (!user) throw new CustomError("Invalid Credentials", StatusCode.Unauthorized);
         return this.createAuthTokens(email, id, UserRole.Lawyer);
      } catch (error) {
         throw new CustomError("Failed to refresh token", StatusCode.Unauthorized, undefined, error);
      }
   }

   async forgotPassword(email: string): Promise<void> {
      const lawyer = await this.lawyerRepository.findByEmail(email);
      if (!lawyer) throw new CustomError("Lawyer not found", StatusCode.NotFound);

      try {
         await this.emailService.sendMail({
            email,
            name: lawyer.name!,
            pathOfTemplate: "../../../public/resetPasswordTemplate.html",
            subject: "No Reply Mail: Password Reset",
            link: `${CLIENT_URL}/lawyer/reset-password`,
         });
      } catch (error) {
         throw new CustomError("Failed to send password reset email", StatusCode.InternalServerError, undefined, error);
      }
   }

   async updatePassword(email: string, newPassword: string): Promise<void> {
      try {
         await this.handlePasswordUpdate(email, newPassword);
      } catch (error) {
         throw new CustomError("Failed to update password", StatusCode.InternalServerError, undefined, error);
      }
   }

   protected async validateUserSpecificFields(userData: Partial<ILawyer>): Promise<void> {
      if (userData.phone) {
         this.validatorService.validatePhoneNumber(userData.phone);
      }
      if (userData.qualifications && Array.isArray(userData.qualifications)) {
         // Validate each qualification in the array
         for (const qualification of userData.qualifications) {
            this.validatorService.validateLength(qualification, 2, 100);
         }
         // Validate array length
         if (userData.qualifications.length === 0) {
            throw new CustomError("At least one qualification is required", StatusCode.BadRequest);
         }
      }
   }
}
