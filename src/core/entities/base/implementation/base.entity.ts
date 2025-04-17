import { IEntity } from '../interfaces/base-entity.entity.interface';

export abstract class BaseEntity implements IEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<BaseEntity>) {
    Object.assign(this, partial);
  }
}
