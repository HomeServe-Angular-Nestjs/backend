import { Admin } from "../../common/entities/implementation/admin.entity";
import { IBaseRepository } from "../../common/repositories/interfaces/base-repo.interface";
import { AdminDocument } from "../../schema/admin.schema";

export interface IAdminRepository extends IBaseRepository<Admin, AdminDocument> { }