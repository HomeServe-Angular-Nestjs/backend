import { BaseEntity } from '@core/entities/base/implementation/base.entity';
import type { UserType } from '@core/entities/interfaces/user.entity.interface';
import type { IWallet } from '@core/entities/interfaces/wallet.entity.interface';

export class Wallet extends BaseEntity implements IWallet {
  userId: string;
  currency: string;
  balance: number;
  type: UserType;
  lastTransactionDate: Date;

  constructor(partial: Partial<Wallet>) {
    super(partial);
    Object.assign(this, partial);
  }
}
