import { Request, Response, NextFunction } from "express";
import { StatusCode } from "@/types";
import { AdminAuthenticationUseCase } from "@/use_case/admin";
import { Cookie } from "@/types";

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
   constructor(private authUseCase: AdminAuthenticationUseCase) {}

   private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
      res.cookie(Cookie.AdminToken, accessToken, {
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
         Cookie.AdminToken,
         Cookie.RefreshToken,
         "accessToken",
         "refreshToken",
         "adminToken", // Add the actual cookie name as seen in browser
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

   async login(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, password } = req.body;
         await this.authUseCase.login(email, password);
         res.status(StatusCode.OK).json({ message: "OTP sent successfully" });
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

   async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, isForVerification = false } = req.body;
         await this.authUseCase.resendOtp(email, isForVerification);
         res.status(StatusCode.OK).json({ message: "OTP resent successfully" });
      } catch (error: any) {
         next(error);
      }
   }

   async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const refreshToken = req.cookies[Cookie.RefreshToken];
         if (!refreshToken) {
            throw new Error("No refresh token provided");
         }

         const result = await this.authUseCase.refreshAccessToken(refreshToken);
         res.status(StatusCode.OK).json({
            accessToken: result.accessToken,
            message: "Token refreshed successfully",
         });
      } catch (error: any) {
         next(error);
      }
   }

   async logout(req: Request, res: Response): Promise<void> {
      res.status(StatusCode.OK).json({ message: "Logged out successfully" });
   }
}
