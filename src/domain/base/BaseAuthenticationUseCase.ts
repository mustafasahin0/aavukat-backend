import { CustomError, StatusCode } from "@/types";
import { UserRole } from "@/domain/types/UserRole";
import IPasswordService from "../interface/services/IPasswordService";
import ITokenService from "../interface/services/ITokenService";
import IEmailService from "../interface/services/IEmailService";
import IValidatorService from "../interface/services/IValidatorService";
import IOtpRepository from "../interface/repositories/IOtpRepository";

// Marked as unused by ts-prune but kept for documentation and future reference
// export interface IAuthUser {
//     _id?: string;
//     email?: string;
//     password?: string;
//     name?: string;
//     isBlocked?: boolean;
//     isVerified?: boolean;
//     role?: UserRole;
// }

// Using internal interface instead to avoid unused exports
interface IAuthUser {
   _id?: string;
   email?: string;
   password?: string;
   name?: string;
   isBlocked?: boolean;
   isVerified?: boolean;
   role?: UserRole;
}

export interface IAuthResponse {
   accessToken?: string;
   refreshToken?: string;
   message?: string;
   email?: string;
}

export interface IBaseRepository<T> {
   findByEmail(email: string): Promise<T | null>;
   findById(id: string): Promise<T | null>;
   findByEmailWithCredentials?(email: string): Promise<T | null>;
   update(id: string, data: T): Promise<T | null | void>;
   create(data: T): Promise<T>;
   updatePassword?(email: string, password: string): Promise<void>;
}

export interface IAdmin extends IAuthUser {
   _id?: string;
   email: string;
   password?: string;
   name?: string;
   isBlocked?: boolean;
   isVerified?: boolean;
   role: UserRole;
}

export interface IValidationConfig {
   requiredFields?: string[];
   phoneRequired?: boolean;
   qualificationsRequired?: boolean;
   customValidations?: ((userData: any) => Promise<void>)[];
}

interface IAuthUserWithPhone extends IAuthUser {
   phone?: string;
}

// Marked as unused by ts-prune but kept for documentation and future reference
// export interface IOtpConfig {
//     customName?: string;
//     expiryMinutes?: number;
//     type?: string;
// }

// Using internal interface instead to avoid unused exports
interface IOtpConfig {
   customName?: string;
   expiryMinutes?: number;
   type?: string;
}

export default abstract class BaseAuthenticationUseCase<T extends IAuthUserWithPhone> {
   constructor(
      protected passwordService: IPasswordService,
      protected tokenService: ITokenService,
      protected emailService: IEmailService,
      protected validatorService: IValidatorService,
      protected otpRepository: IOtpRepository,
      protected userRepository: IBaseRepository<T>
   ) {}

   // Public abstract methods that must be implemented by child classes
   abstract login(email: string, password: string): Promise<IAuthResponse>;
   abstract resendOtp(email: string, isForVerification?: boolean): Promise<IAuthResponse>;
   protected abstract validateUserSpecificFields(userData: Partial<T>): Promise<void>;

   // Core authentication flows
   protected async handleAuthFlow(
      email: string,
      password: string,
      role: UserRole,
      config: IValidationConfig = {}
   ): Promise<IAuthResponse> {
      const user = await this.findUserByEmailWithCredentials(email);
      if (!user) throw new CustomError("Invalid Credentials", StatusCode.Unauthorized);

      const authUser = this.convertToAuthUser(user);
      await this.validateUserWithRole(authUser, role);
      await this.validateCredentials(email, password, authUser.password!);

      const otpResponse = await this.handleOtpGeneration(email, authUser.name || "");
      return otpResponse;
   }

   protected async handleOAuthFlow(
      email: string,
      name: string,
      additionalData: Record<string, any> = {},
      role: UserRole
   ): Promise<IAuthResponse> {
      const user = await this.findUserByEmailWithCredentials(email);

      if (!user) {
         // Create new user for OAuth
         const userData = {
            email,
            name,
            isVerified: true,
            role,
            ...additionalData,
         } as Partial<T>;
         await this.validateUserSpecificFields(userData);
         const newUser = await this.userRepository.create(userData as T);
         return this.generateTokens(newUser);
      }

      await this.validateUserWithRole(user, role);
      return this.generateTokens(user);
   }

   protected async handleOtpFlow(email: string, code: string, role: UserRole): Promise<IAuthResponse> {
      await this.validateOtpInput(email, code);
      const user = await this.userRepository.findByEmail(email);
      
      // Check if user exists
      if (!user) {
         throw new CustomError("User not found", StatusCode.NotFound);
      }
      
      const authUser = this.convertToAuthUser(user);
      
      // Skip the isVerified check during OTP verification
      // since the purpose of this flow might be to verify the user
      try {
         await this.validateUserWithRole(authUser, role);
      } catch (error) {
         // If the only issue is that the user is not verified,
         // we'll continue with the flow and update their verification status
         if (error instanceof CustomError && 
             error.message === "Please verify your email first" && 
             authUser.isVerified === false) {
             
            // Update the user's verification status
            user.isVerified = true;
            await this.userRepository.update(user._id!, user);
         } else {
            // If there's any other validation error, throw it
            throw error;
         }
      }

      const tokens = this.createAuthTokens(email, authUser._id!, role);
      await this.otpRepository.deleteByEmail(email);

      return {
         ...tokens,
         message: "Email verified and login successful",
      };
   }

   // User validation and conversion
   private async validateUserWithRole(user: IAuthUser, expectedRole: UserRole): Promise<void> {
      if (!user) throw new CustomError("Invalid credentials", StatusCode.Unauthorized);
      if (user.role !== expectedRole) throw new CustomError("Invalid role", StatusCode.Unauthorized);
      if (user.isBlocked) throw new CustomError("Account is blocked", StatusCode.Forbidden);
      if (user.isVerified === false) throw new CustomError("Please verify your email first", StatusCode.Unauthorized);
   }

   private convertToAuthUser(user: T | null): IAuthUser {
      if (!user) throw new CustomError("User not found", StatusCode.NotFound);
      return {
         _id: user._id,
         email: user.email,
         password: user.password,
         name: user.name,
         isBlocked: user.isBlocked,
         isVerified: user.isVerified,
         role: user.role,
      };
   }

   // OTP handling
   protected async handleOtpGeneration(email: string, name: string, config: IOtpConfig = {}): Promise<IAuthResponse> {
      const code = this.generateOtpCode(email);
      const expiryMinutes = config.expiryMinutes || 5;

      const otp = {
         code,
         email,
         name: config.customName || name,
         expiry: new Date(Date.now() + expiryMinutes * 60 * 1000),
         type: config.type || "login",
      };

      try {
         await this.emailService.sendOtp(otp);
      } catch (error) {
         // Log the error but don't fail the whole process
         console.error("Failed to send OTP email:", error);
         console.log("Continuing registration process with OTP:", code);
      }
      
      try {
         await this.otpRepository.create(otp, email);
      } catch (error) {
         console.error("Failed to store OTP:", error);
         throw error; // This is a critical error so we'll still throw it
      }

      return {
         message: "Please check your email for verification code",
         email,
      };
   }

   private generateOtpCode(email: string): string {
      const isDemoAccount = email.startsWith("demo") && email.endsWith("@gmail.com");
      return isDemoAccount
         ? "777777"
         : Math.floor(100000 + Math.random() * 900000)
              .toString()
              .padStart(6, "0");
   }

   protected async validateOtpInput(email: string, code: string): Promise<void> {
      this.validatorService.validateEmailFormat(email);
      this.validatorService.validateOtpCode(code);

      const otp = await this.otpRepository.findByEmail(email);
      if (!otp) throw new CustomError("Invalid OTP", StatusCode.Unauthorized);

      if (otp.code !== code) {
         console.error(`OTP validation failed for ${email}. Expected: ${otp.code}, Received: ${code}`);
         throw new CustomError("Invalid OTP", StatusCode.Unauthorized);
      }

      if (otp.expiry < new Date()) throw new CustomError("OTP has expired", StatusCode.Unauthorized);
   }

   // Token handling
   protected createAuthTokens(
      email: string,
      userId: string,
      role: UserRole
   ): { accessToken: string; refreshToken: string } {
      const accessToken = this.tokenService.createAccessToken(email, userId, role);
      const refreshToken = this.tokenService.createRefreshToken(email, userId);

      if (!accessToken || !refreshToken) {
         throw new CustomError("Failed to generate auth tokens", StatusCode.InternalServerError);
      }

      return { accessToken, refreshToken };
   }

   // Password handling
   protected async validateCredentials(email: string, password: string, storedPassword: string): Promise<void> {
      this.validatorService.validateEmailFormat(email);
      this.validatorService.validatePassword(password);

      if (!(await this.passwordService.compare(password, storedPassword))) {
         throw new CustomError("Invalid Credentials", StatusCode.Unauthorized);
      }
   }

   protected async handlePasswordUpdate(email: string, newPassword: string): Promise<void> {
      const user = await this.userRepository.findByEmail(email);
      if (!user) throw new CustomError("User not found", StatusCode.NotFound);

      const hashedPassword = await this.passwordService.hash(newPassword);
      if (this.userRepository.updatePassword) {
         await this.userRepository.updatePassword(email, hashedPassword);
      } else {
         user.password = hashedPassword;
         await this.userRepository.update(user._id!, user);
      }
   }

   // Repository operations
   private async findUserByEmailWithCredentials(email: string): Promise<T | null> {
      if (!this.userRepository.findByEmailWithCredentials) {
         throw new Error("Repository does not implement findByEmailWithCredentials");
      }
      return this.userRepository.findByEmailWithCredentials(email);
   }

   // Registration handling
   protected async validateRegistrationFields(userData: Partial<T>, config: IValidationConfig = {}): Promise<void> {
      // Basic validation
      this.validatorService.validateRequiredFields({
         password: userData.password,
         name: userData.name,
         email: userData.email,
         ...config.requiredFields?.reduce((acc, field) => ({ ...acc, [field]: userData[field as keyof T] }), {}),
      });

      // Standard field validation
      this.validatorService.validateEmailFormat(userData.email!);
      this.validatorService.validatePassword(userData.password!);
      this.validatorService.validateLength(userData.name!, 3, 20);

      // Phone validation if required
      if (config.phoneRequired && userData.phone) {
         this.validatorService.validatePhoneNumber(userData.phone);
      }

      // Custom validations
      if (config.customValidations) {
         for (const validation of config.customValidations) {
            await validation(userData);
         }
      }

      // User-specific validations
      await this.validateUserSpecificFields(userData);
   }

   protected async generateTokens(user: T): Promise<{ accessToken: string; refreshToken: string }> {
      if (!user._id || !user.email || !user.role) {
         throw new CustomError("Invalid user data for token generation", StatusCode.InternalServerError);
      }

      const accessToken = await this.tokenService.createAccessToken(user.email, user._id, user.role);
      const refreshToken = await this.tokenService.createRefreshToken(user.email, user._id);

      return { accessToken, refreshToken };
   }
}
