import { Admin } from "../../auth/common/entities/implementation/admin.entity";

export interface ISeedAdminService {
    seedAdmin(): Promise<Admin>
}