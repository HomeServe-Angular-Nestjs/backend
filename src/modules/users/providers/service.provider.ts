import { Provider } from '@nestjs/common';
import {
  CUSTOMER_SERVICE_NAME,
  PROVIDER_SERVICE_NAME,
  TOKEN_SERVICE_NAME,
} from '../../../core/constants/service.constant';
import { CustomerService } from '../../customer/services/implementations/customer.service';
import { ProviderServices } from '../../providers/services/implementations/provider.service';
import { TokenService } from '../../auth/services/implementations/token.service';
import { FAST2SMS_UTILITY_NAME } from '../../../core/constants/utility.constant';
import { Fast2SmsService } from '../../../core/utilities/implementations/fast2sms.utility';

export const userServiceProvider: Provider[] = [
  {
    provide: CUSTOMER_SERVICE_NAME,
    useClass: CustomerService,
  },
  {
    provide: PROVIDER_SERVICE_NAME,
    useClass: ProviderServices,
  },
  {
    provide: TOKEN_SERVICE_NAME,
    useClass: TokenService
  },
];
