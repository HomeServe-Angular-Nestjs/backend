import { IAdmin } from "@core/entities/interfaces/admin.entity.interface";

export interface ISeedAdminService {
  seedAdmin(email: string, password: string): Promise<IAdmin | null>;
}
