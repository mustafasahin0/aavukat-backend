import { IAdmin } from "@/domain/base/BaseAuthenticationUseCase";

export default interface IAdminRepository {
   findById(id: string): Promise<IAdmin | null>;
   findByEmail(email: string): Promise<IAdmin | null>;
   findByEmailWithCredentials(email: string): Promise<IAdmin | null>;
   create(admin: IAdmin): Promise<IAdmin>;
   update(id: string, admin: IAdmin): Promise<void>;
}
