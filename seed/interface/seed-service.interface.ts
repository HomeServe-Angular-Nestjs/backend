import { IAdmin } from "@core/entities/interfaces/admin.entity.interface"; 

export interface ISeedAdminService {
  seedAdmin(): Promise<IAdmin | null>;
}
