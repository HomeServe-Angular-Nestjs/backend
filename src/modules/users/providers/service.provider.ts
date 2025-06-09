import { Provider } from '@nestjs/common';
import {
  ADMIN_USERMANAGEMENT_SERVICE_NAME,
  TOKEN_SERVICE_NAME,
} from '../../../core/constants/service.constant';
import { TokenService } from '../../auth/services/implementations/token.service';
import { AdminUserManagementService } from '../services/implementations/admin-user.service';

export const userServiceProvider: Provider[] = [
  {
    provide: ADMIN_USERMANAGEMENT_SERVICE_NAME,
    useClass: AdminUserManagementService
  },
  {
    provide: TOKEN_SERVICE_NAME,
    useClass: TokenService
  },
];
