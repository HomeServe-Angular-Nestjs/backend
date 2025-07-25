import { Admin } from "../../src/core/entities/implementation/admin.entity";

export interface ISeedAdminService {
  seedAdmin(): Promise<Admin>;
}
