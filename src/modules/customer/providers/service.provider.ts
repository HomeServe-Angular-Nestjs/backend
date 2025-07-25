import { Provider } from '@nestjs/common';

import {
    CUSTOMER_SERVICE_NAME, TOKEN_SERVICE_NAME
} from '../../../core/constants/service.constant';
import { TokenService } from '../../auth/services/implementations/token.service';
import { CustomerService } from '../services/implementations/customer.service';

export const customerServiceProviders: Provider[] = [
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService,
    },
    {
        provide: CUSTOMER_SERVICE_NAME,
        useClass: CustomerService
    }
] 