import type { IEntity } from '@core/entities/base/interfaces/base-entity.entity.interface';
import type { UserType } from '@core/entities/interfaces/user.entity.interface';

export interface IWallet extends IEntity {
  userId: string;
  currency: string;
  balance: number;
  type: UserType;
  lastTransactionDate: Date;
}
