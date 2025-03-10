import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import IPasswordService from "@/domain/interface/services/IPasswordService";
import ITokenService from "@/domain/interface/services/ITokenService";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import IEmailService from "@/domain/interface/services/IEmailService";
import IOtpRepository from "@/domain/interface/repositories/IOtpRepository";
import IClient from "@/domain/entities/IClient";
import { CustomError, StatusCode, UserRole } from "@/types";
import { CLIENT_URL } from "@/config/env";
import BaseAuthenticationUseCase, { IAuthResponse, IValidationConfig } from "@/domain/base/BaseAuthenticationUseCase";

export default class ClientAuthenticationUseCase extends BaseAuthenticationUseCase<IClient> {
   private static readonly DEFAULT_VALIDATION_CONFIG: IValidationConfig = {
      phoneRequired: true,
      requiredFields: ["email", "password", "name"],
   };

   constructor(
      private clientRepository: IClientRepository,
      passwordService: IPasswordService,
      tokenService: ITokenService,
      emailService: IEmailService,
      otpRepository: IOtpRepository,
      validatorService: IValidatorService
   ) {
      super(passwordService, tokenService, emailService, validatorService, otpRepository, clientRepository);
   }

   async register(userData: Partial<IClient>): Promise<IAuthResponse> {
      await this.validateRegistrationFields(userData, ClientAuthenticationUseCase.DEFAULT_VALIDATION_CONFIG);

      const existingClient = await this.clientRepository.findByEmail(userData.email!);
      if (existingClient) {
         throw new CustomError("Email already registered", StatusCode.Conflict);
      }

      const hashedPassword = await this.passwordService.hash(userData.password!);
      const client = await this.clientRepository.create({
         ...userData,
         password: hashedPassword,
         role: UserRole.Client,
         isVerified: false,
      } as IClient);

      if (!client.email || !client.name) {
         throw new CustomError("Invalid client data", StatusCode.InternalServerError);
      }

      return this.handleOtpGeneration(client.email, client.name, { type: "register" });
   }

   async login(email: string, password: string): Promise<IAuthResponse> {
      if (!email || !password) {
         throw new CustomError("Email and password are required", StatusCode.BadRequest);
      }
      // Special handling for demo user
      if (email === "demouser@gmail.com") {
         return { email };
      }
      return this.handleAuthFlow(email, password, UserRole.Client);
   }

   async resendOtp(email: string, isForVerification: boolean = false): Promise<IAuthResponse> {
      if (!email) {
         throw new CustomError("Email is required", StatusCode.BadRequest);
      }
      const client = await this.clientRepository.findByEmail(email);
      if (!client) throw new CustomError("Client not found", StatusCode.NotFound);
      if (!client.name) {
         throw new CustomError("Client name is missing", StatusCode.BadRequest);
      }

      // If this is for email verification and the client is already verified, throw an error
      if (isForVerification && client.isVerified) {
         throw new CustomError("Email is already verified", StatusCode.BadRequest);
      }

      // If the client isn't verified yet, this is for registration verification
      const otpType = client.isVerified ? "login" : "register";
      return await this.handleOtpGeneration(email, client.name, { type: otpType });
   }

   async validateOtpAndLogin(email: string, code: string): Promise<{ accessToken: string; refreshToken: string }> {
      const response = await this.handleOtpFlow(email, code, UserRole.Client);
      if (!response.accessToken || !response.refreshToken) {
         throw new CustomError("Failed to generate tokens", StatusCode.InternalServerError);
      }
      return { accessToken: response.accessToken, refreshToken: response.refreshToken };
   }

   async validateOtpForSignup(email: string, code: string): Promise<void> {
      // Use a separate method to validate OTP for signup without generating tokens
      await this.validateOtpInput(email, code);
      
      const client = await this.clientRepository.findByEmail(email);
      if (!client) {
         throw new CustomError("Client not found", StatusCode.NotFound);
      }
      
      // Update the client's verification status
      client.isVerified = true;
      await this.clientRepository.update(client._id!, client);
      
      // Delete the OTP after successful verification
      await this.otpRepository.deleteByEmail(email);
   }

   async oAuthSignin(
      email: string,
      name: string,
      profile?: string
   ): Promise<{ accessToken: string; refreshToken: string }> {
      const response = await this.handleOAuthFlow(email, name, { profile }, UserRole.Client);
      if (!response.accessToken || !response.refreshToken) {
         throw new CustomError("Failed to generate tokens", StatusCode.InternalServerError);
      }
      return {
         accessToken: response.accessToken,
         refreshToken: response.refreshToken,
      };
   }

   async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
      const { id, email } = this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.clientRepository.findById(id);
      if (!user) throw new CustomError("Invalid Credentials", StatusCode.Unauthorized);
      return this.createAuthTokens(email, id, UserRole.Client);
   }

   async forgotPassword(email: string): Promise<void> {
      const client = await this.clientRepository.findByEmail(email);
      if (!client) throw new CustomError("Client not found", StatusCode.NotFound);

      await this.emailService.sendMail({
         email,
         name: client.name!,
         pathOfTemplate: "../../../public/resetPasswordTemplate.html",
         subject: "No Reply Mail: Password Reset",
         link: `${CLIENT_URL}/client/reset-password`,
      });
   }

   async updatePassword(email: string, newPassword: string): Promise<void> {
      await this.handlePasswordUpdate(email, newPassword);
   }

   protected async validateUserSpecificFields(userData: Partial<IClient>): Promise<void> {
      if (userData.phone) {
         this.validatorService.validatePhoneNumber(userData.phone);
      }
   }
}
