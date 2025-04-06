import { Admin } from "../../entities/implementation/admin.entity";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { AdminDocument } from "../../schema/admin.schema";

export interface IAdminRepository extends IBaseRepository<Admin, AdminDocument> { }