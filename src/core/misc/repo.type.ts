import { IAdminRepository } from '../repositories/interfaces/admin-repo.interface';
import { ICustomerRepository } from '../repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '../repositories/interfaces/provider-repo.interface';

export type UserReposType =
  | ICustomerRepository
  | IProviderRepository
  | IAdminRepository;
