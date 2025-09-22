import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { SharedModule } from '../../shared/shared.module';
import { AdminApprovalsController } from './controllers/approvals.controller';
import { AdminBookingController } from './controllers/bookings.controller';
import { AdminDashboardController } from './controllers/dashboard.controller';
import { ReviewController } from './controllers/reviews.controller';
import { AdminUserController } from './controllers/user.controller';
import { adminRepositoryProviders } from './providers/repository.provider';
import { userServiceProvider } from './providers/service.provider';
import { adminUtilityProviders } from './providers/utility.provider';
import { PdfModule } from '@core/services/pdf/pdf.module';
import { AdminTransactionController } from '@modules/users/controllers/transaction.controller';
import { AdminSettingsController } from '@modules/users/controllers/settings.controller';

@Module({
  imports: [
    CloudinaryModule.registerAsync(),
    JwtConfigModule,
    HttpModule,
    SharedModule,
    PdfModule
  ],
  controllers: [
    AdminUserController,
    AdminApprovalsController,
    AdminBookingController,
    ReviewController,
    AdminDashboardController,
    AdminTransactionController,
    AdminSettingsController,
  ],
  providers: [
    ...userServiceProvider,
    ...adminRepositoryProviders,
    ...adminUtilityProviders
  ],
})
export class AdminModule { }
