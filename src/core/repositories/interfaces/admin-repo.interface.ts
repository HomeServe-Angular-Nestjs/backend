import { Admin } from '../../entities/implementation/admin.entity';
import { AdminDocument } from '../../schema/admin.schema';
import { IBaseRepository } from '../base/interfaces/base-repo.interface';

export interface IAdminRepository extends IBaseRepository<Admin, AdminDocument> {
  findByEmail(email: string): Promise<Admin | null>;

}
