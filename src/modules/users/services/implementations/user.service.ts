import { Inject, Injectable } from '@nestjs/common';
import { IUserService } from '../interfaces/user-service.interface';
import { Customer } from '../../../../core/entities/implementation/customer.entity';
import {
  CUSTOMER_REPOSITORY_INTERFACE_NAME,
  PROVIDER_REPOSITORY_INTERFACE_NAME,
} from '../../../../core/constants/repository.constant';
import { ICustomerRepository } from '../../../../core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '../../../../core/repositories/interfaces/provider-repo.interface';
import { Provider } from '../../../../core/entities/implementation/provider.entity';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
    private customerRepository: ICustomerRepository,
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private providerRepository: IProviderRepository,
  ) { }

  async getCustomers(): Promise<Customer[]> {
    return await this.customerRepository.find({ isDeleted: false });
  }

  async getProviders(): Promise<Provider[]> {
    return await this.providerRepository.find({ isDeleted: false });
  }
}
