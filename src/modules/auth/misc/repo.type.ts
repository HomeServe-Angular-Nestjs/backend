import { IAdminRepository } from "../../../core/repositories/interfaces/admin-repo.interface";
import { ICustomerRepository } from "../../../core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "../../../core/repositories/interfaces/provider-repo.interface";

export type UserReposType = ICustomerRepository | IProviderRepository | IAdminRepository;