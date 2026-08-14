import type { IProfession } from '@core/entities/interfaces/profession.entity.interface';
import type { ProfessionDocument } from '@core/schema/profession.schema';

export interface IProfessionMapper {
  toEntity(document: ProfessionDocument): IProfession;
  toDocument(dto: IProfession): Partial<ProfessionDocument>;
}
