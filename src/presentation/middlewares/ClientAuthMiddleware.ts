import { CustomRequest } from "@/types";
import { UserRole } from "@/domain/types/UserRole";
import ITokenService from "@/domain/interface/services/ITokenService";
import BaseAuthMiddleware from "./BaseAuthMiddleware";

export default class ClientAuthMiddleware extends BaseAuthMiddleware {
   constructor(tokenService: ITokenService) {
      super(tokenService);
   }

   protected validateRole(role: UserRole): boolean {
      return role === UserRole.Client;
   }

   protected enrichRequest(req: CustomRequest, email: string, id: string): void {
      req.client = { email, id };
   }
}
