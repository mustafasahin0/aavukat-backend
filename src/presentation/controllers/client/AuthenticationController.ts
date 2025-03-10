import { Request, Response, NextFunction } from "express";
import AuthenticationUseCase from "../../../use_case/client/AuthenticationUseCase";
import { StatusCode } from "@/types";
import { Cookie } from "@/types/enum";
import { ClientAuthenticationUseCase } from "@/use_case/client";

const COOKIE_OPTIONS = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "strict" as const,
   path: "/",
   domain: "localhost", // Add domain to ensure cookies are cleared properly
};

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export default class AuthenticationController {
   constructor(private authUseCase: ClientAuthenticationUseCase) {}

   private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
      res.cookie(Cookie.ClientToken, accessToken, {
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
         Cookie.ClientToken,
         Cookie.RefreshToken,
         "accessToken",
         "refreshToken",
         "clientToken", // Add the actual cookie name as seen in browser
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

   async register(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const client = req.body;
         const result = await this.authUseCase.register(client);
         res.status(StatusCode.Created).json({ message: result });
      } catch (error: any) {
         next(error); // Pass the error to the error handling middleware
      }
   }

   async login(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, password } = req.body;
         const result = await this.authUseCase.login(email, password);
         res.status(StatusCode.OK).json(result);
      } catch (error: any) {
         next(error); // Pass the error to the error handling middleware
      }
   }

   async validateOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, otp, isSignup = false } = req.body;
         
         // For signup verification, just verify without generating tokens
         if (isSignup) {
            const result = await this.authUseCase.validateOtpForSignup(email, otp);
            res.status(StatusCode.OK).json({
               message: "Email verified successfully. Please sign in.",
            });
         } else {
            // For login verification, proceed with the existing flow
            const result = await this.authUseCase.validateOtpAndLogin(email, otp);
            this.setAuthCookies(res, result.accessToken, result.refreshToken);
            res.status(StatusCode.OK).json(result);
         }
      } catch (error: any) {
         next(error); // Pass the error to the error handling middleware
      }
   }

   async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, isForVerification = false } = req.body;
         const result = await this.authUseCase.resendOtp(email, isForVerification);
         res.status(StatusCode.OK).json(result);
      } catch (error: any) {
         next(error); // Pass the error to the error handling middleware instead of throwing
      }
   }

   async oAuthSignin(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { email, name, profile } = req.body;
         const result = await this.authUseCase.oAuthSignin(email, name, profile);
         res.status(StatusCode.OK).json({ accessToken: result.accessToken });
      } catch (error: any) {
         next(error); // Pass the error to the error handling middleware
      }
   }

   async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const { refreshToken } = req.body;
         const result = await this.authUseCase.refreshAccessToken(refreshToken);
         res.status(StatusCode.OK).json({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
         });
      } catch (error: any) {
         next(error); // Pass the error to the error handling middleware
      }
   }

   async logout(req: Request, res: Response): Promise<void> {
      res.status(StatusCode.OK).json({ message: "Logged out successfully" });
   }
}
