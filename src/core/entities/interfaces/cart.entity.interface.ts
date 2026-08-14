import type { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import type { IProviderServiceUI } from '@core/entities/interfaces/provider-service.entity.interface';
import { IProviderService } from '@core/entities/interfaces/provider-service.entity.interface';

export interface ICart extends IEntity {
  customerId: string;
  items: string[];
}

export interface ICartPopulated extends Omit<ICart, 'items'> {
  items: IProviderServiceUI[];
}
