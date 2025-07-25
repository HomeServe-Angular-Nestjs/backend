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

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule, HttpModule, SharedModule],
  controllers: [AdminUserController, AdminApprovalsController, AdminBookingController, ReviewController, AdminDashboardController],
  providers: [...userServiceProvider, ...adminRepositoryProviders, ...adminUtilityProviders],
})
export class AdminModule { }
