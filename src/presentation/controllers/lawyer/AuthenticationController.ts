import { NextFunction, Request, Response } from "express";
import { LawyerAuthenticationUseCase } from "@/use_case/lawyer";
import { StatusCode } from "@/types";
import { Cookie } from "@/types/enum";
import ILawyer from "@/domain/entities/ILawyer";

const COOKIE_OPTIONS = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "strict" as const,
   path: "/",
   domain: process.env.COOKIE_DOMAIN || "localhost",
};

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export default class AuthenticationController {
   constructor(private authUseCase: LawyerAuthenticationUseCase) {}

   private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
      res.cookie(Cookie.LawyerToken, accessToken, {
         ...COOKIE_OPTIONS,
         maxAge: ACCESS_TOKEN_EXPIRY,
      });

      res.cookie(Cookie.RefreshToken, refreshToken, {
         ...COOKIE_OPTIONS,
         maxAge: REFRESH_TOKEN_EXPIRY,
      });
   }

   private clearAuthCookies(res: Response) {
      const cookieNames = [
         Cookie.LawyerToken,
         Cookie.RefreshToken,
         "accessToken",
         "refreshToken",
         "lawyerToken", // Add the actual cookie name as seen in browser
      ];

      // Clear with multiple combinations of options to ensure removal
      cookieNames.forEach((cookieName) => {
         // Clear with full options
         res.clearCookie(cookieName, {
            ...COOKIE_OPTIONS,
            maxAge: 0,
            expires: new Date(0),
         });

         // Clear with minimal options (sometimes needed)
         res.clearCookie(cookieName, {
            path: "/",
            domain: process.env.COOKIE_DOMAIN || "localhost",
         });

         // Clear with no options (fallback)
         res.clearCookie(cookieName);
      });
   }

   async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, password } = req.body;
         const result = await this.authUseCase.login(email, password);
         res.status(StatusCode.OK).json(result);
      } catch (error: any) {
         next(error);
      }
   }

   async validateOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, otp } = req.body;
         const result = await this.authUseCase.validateOtpAndLogin(email, otp);
         res.status(StatusCode.OK).json(result);
      } catch (error: any) {
         next(error);
      }
   }

   async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { refreshToken } = req.body;
         const result = await this.authUseCase.refreshToken(refreshToken);
         res.status(StatusCode.OK).json({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
         });
      } catch (error: any) {
         next(error);
      }
   }

   async logout(req: Request, res: Response): Promise<void> {
      res.status(StatusCode.OK).json({ message: "Logged out successfully" });
   }

   async signup(req: Request, res: Response, next: NextFunction) {
      try {
         const lawyer = req.body;
         const id = await this.authUseCase.register(lawyer);
         res.status(StatusCode.OK).json({
            message: "Registration successful. Please verify your email.",
            id: id,
         });
      } catch (error: any) {
         next(error);
      }
   }

   async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, isForVerification = false } = req.body;
         await this.authUseCase.resendOtp(email, isForVerification);
         res.status(StatusCode.OK).json({ message: "OTP resent successfully" });
      } catch (error: any) {
         next(error);
      }
   }

   async sendForgotPasswordMail(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email } = req.body;
         await this.authUseCase.forgotPassword(email);
         res.status(StatusCode.OK).json({ message: "Password reset link sent successfully" });
      } catch (error: any) {
         next(error);
      }
   }

   async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, password } = req.body;
         await this.authUseCase.updatePassword(email, password);
         res.status(StatusCode.OK).json({ message: "Password updated successfully" });
      } catch (error: any) {
         next(error);
      }
   }

   async getUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { key } = req.query;
         const url = await this.authUseCase.getUploadUrl(key as string);
         res.status(StatusCode.OK).json({ url, key });
      } catch (error: any) {
         next(error);
      }
   }

   async updateProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { id } = req.params;
         const { key } = req.body;
         await this.authUseCase.updateProfileImage(id, key);
         res.status(StatusCode.OK).json({ message: "Profile image updated successfully" });
      } catch (error: any) {
         next(error);
      }
   }
}
