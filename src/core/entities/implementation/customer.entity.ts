import { BaseUserEntity } from '../base/implementation/base-user.entity';
import { ICustomer } from '../interfaces/user.entity.interface';

export class Customer extends BaseUserEntity implements ICustomer {
  savedProviders?: string[] | null;
  isReviewed: boolean;

  constructor(partial: Partial<Customer>) {
    super(partial);
    Object.assign(this, partial);
  }
}
