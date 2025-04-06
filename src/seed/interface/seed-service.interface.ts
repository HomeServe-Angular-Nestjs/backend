import { Admin } from "../../core/entities/implementation/admin.entity";

export interface ISeedAdminService {
    seedAdmin(): Promise<Admin>
}