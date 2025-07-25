import { Provider } from '@nestjs/common';

import {
    ADMIN_APPROVAL_SERVICE_NAME, ADMIN_BOOKINGS_SERVICE_NAME, ADMIN_DASHBOARD_OVERVIEW_SERVICE_NAME,
    ADMIN_REVIEWS_SERVICE_NAME, ADMIN_USER_MANAGEMENT_SERVICE_NAME, TOKEN_SERVICE_NAME
} from '../../../core/constants/service.constant';
import { TokenService } from '../../auth/services/implementations/token.service';
import { AdminApprovalService } from '../services/implementations/admin-approval.service';
import { AdminBookingService } from '../services/implementations/admin-bookings.service';
import {
    AdminDashboardOverviewService
} from '../services/implementations/admin-dashboard-overview.service';
import { AdminReviewService } from '../services/implementations/admin-reviews.service';
import { AdminUserManagementService } from '../services/implementations/admin-user.service';

export const userServiceProvider: Provider[] = [
  {
    provide: ADMIN_USER_MANAGEMENT_SERVICE_NAME,
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
  {
    provide: ADMIN_BOOKINGS_SERVICE_NAME,
    useClass: AdminBookingService
  },
  {
    provide: ADMIN_REVIEWS_SERVICE_NAME,
    useClass: AdminReviewService
  },
  {
    provide: ADMIN_DASHBOARD_OVERVIEW_SERVICE_NAME,
    useClass: AdminDashboardOverviewService
  }
];
