import { UserRole } from "@/domain/types/UserRole";
import ITokenService from "@/domain/interface/services/ITokenService";
import jwt from "jsonwebtoken";

export default class TokenService implements ITokenService {
   private readonly refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";
   private readonly accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access-secret";
   private readonly refreshTokenExpiry = "7d";
   private readonly accessTokenExpiry = "1d";

   createRefreshToken(email: string, id: string): string {
      return jwt.sign({ email, id }, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiry });
   }

   verifyRefreshToken(token: string): { email: string; id: string } {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as { email: string; id: string };
      return { email: decoded.email, id: decoded.id };
   }

   createAccessToken(email: string, id: string, role: UserRole): string {
      return jwt.sign({ email, id, role }, this.accessTokenSecret, { expiresIn: this.accessTokenExpiry });
   }

   verifyAccessToken(token: string): { email: string; id: string; role: UserRole } {
      const decoded = jwt.verify(token, this.accessTokenSecret) as { email: string; id: string; role: UserRole };
      return { email: decoded.email, id: decoded.id, role: decoded.role };
   }
}
