import { CustomError, StatusCode, UserRole } from "@/types";
import IPasswordService from "@/domain/interface/services/IPasswordService";
import ITokenService from "@/domain/interface/services/ITokenService";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import IEmailService from "@/domain/interface/services/IEmailService";
import IOtpRepository from "@/domain/interface/repositories/IOtpRepository";
import BaseAuthenticationUseCase, { IAuthResponse, IAdmin } from "@/domain/base/BaseAuthenticationUseCase";
import IAdminRepository from "@/domain/interface/repositories/IAdminRepository";

export default class AdminAuthenticationUseCase extends BaseAuthenticationUseCase<IAdmin> {
   constructor(
      private adminRepository: IAdminRepository,
      passwordService: IPasswordService,
      tokenService: ITokenService,
      emailService: IEmailService,
      otpRepository: IOtpRepository,
      validatorService: IValidatorService
   ) {
      super(passwordService, tokenService, emailService, validatorService, otpRepository, adminRepository);
   }

   async login(email: string, password: string): Promise<IAuthResponse> {
      return this.handleAuthFlow(email, password, UserRole.Admin, {
         requiredFields: ["email", "password"],
      });
   }

   async validateOtpAndLogin(email: string, otp: string): Promise<{ accessToken: string; refreshToken: string }> {
      const response = await this.handleOtpFlow(email, otp, UserRole.Admin);
      if (!response.accessToken || !response.refreshToken) {
         throw new CustomError("Failed to generate tokens", StatusCode.InternalServerError);
      }
      return { accessToken: response.accessToken, refreshToken: response.refreshToken };
   }

   async resendOtp(email: string, isForVerification: boolean = false): Promise<IAuthResponse> {
      const admin = await this.adminRepository.findByEmail(email);
      if (!admin) throw new CustomError("Admin not found", StatusCode.NotFound);

      if (isForVerification && admin.isVerified) {
         throw new CustomError("Email is already verified", StatusCode.BadRequest);
      }

      return {
         message: "Please check your email for verification code",
         email,
      };
   }

   async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
      const { id, email } = this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.adminRepository.findById(id);
      if (!user) throw new CustomError("Invalid Credentials", StatusCode.Unauthorized);
      return this.createAuthTokens(email, id, UserRole.Admin);
   }

   protected async validateUserSpecificFields(userData: Partial<IAdmin>): Promise<void> {
      // Admin-specific validations if needed
      // Currently, basic validations are handled by the base class
   }
}
