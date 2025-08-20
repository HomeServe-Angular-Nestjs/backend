import { AdminDocument } from '../../schema/admin.schema';
import { IBaseRepository } from '../base/interfaces/base-repo.interface';

export interface IAdminRepository extends IBaseRepository<AdminDocument> {
  findByEmail(email: string): Promise<AdminDocument | null>;
  createAdmin(email: string, password: string): Promise<AdminDocument>;
}
