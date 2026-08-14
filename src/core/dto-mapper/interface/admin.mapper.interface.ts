import type { IAdmin } from '@core/entities/interfaces/admin.entity.interface';
import type { AdminDocument } from '@core/schema/admin.schema';

export interface IAdminMapper {
  toEntity(doc: AdminDocument): IAdmin;
  toDocument(entity: Partial<IAdmin>): Partial<AdminDocument>;
}
