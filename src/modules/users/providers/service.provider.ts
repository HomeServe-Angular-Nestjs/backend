import { Provider } from '@nestjs/common';
import {
  ADMIN_APPROVAL_SERVICE_NAME,
  ADMIN_USERMANAGEMENT_SERVICE_NAME,
  TOKEN_SERVICE_NAME,
} from '../../../core/constants/service.constant';
import { TokenService } from '../../auth/services/implementations/token.service';
import { AdminUserManagementService } from '../services/implementations/admin-user.service';
import { AdminApprovalService } from '../services/implementations/admin-approval.service';

export const userServiceProvider: Provider[] = [
  {
    provide: ADMIN_USERMANAGEMENT_SERVICE_NAME,
    useClass: AdminUserManagementService
  },
  {
    provide: TOKEN_SERVICE_NAME,
    useClass: TokenService
  },
  {
    provide: ADMIN_APPROVAL_SERVICE_NAME,
    useClass: AdminApprovalService
  },
];
