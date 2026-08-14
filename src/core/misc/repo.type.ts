import type { IAdminRepository } from '../repositories/interfaces/admin-repo.interface';
import type { ICustomerRepository } from '../repositories/interfaces/customer-repo.interface';
import type { IProviderRepository } from '../repositories/interfaces/provider-repo.interface';

export type UserReposType = ICustomerRepository | IProviderRepository | IAdminRepository;
