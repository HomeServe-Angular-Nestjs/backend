import {
  Controller,
  Get,
  Inject,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CUSTOMER_SERVICE_NAME, PROVIDER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { ICustomerService } from '../../customer/services/interfaces/customer-service.interface';
import { IProviderServices } from '../../providers/services/interfaces/provider-service.interface';

@Controller()
@UseInterceptors(AuthInterceptor)
export class AdminController {
  constructor(
    @Inject(CUSTOMER_SERVICE_NAME)
    private readonly customerService: ICustomerService,
    @Inject(PROVIDER_SERVICE_NAME)
    private readonly providerService: IProviderServices
  ) { }

  @Get(['admin/customers'])
  async getCustomer() {
    return await this.customerService.getCustomers();
  }

  @Get(['admin/providers'])
  async getProvider() {
    return await this.providerService.getProviders();
  }
}
