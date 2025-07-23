import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { AdminApprovalsController } from './controllers/approvals.controller';
import { AdminUserController } from './controllers/user.controller';
import { adminRepositoryProviders } from './providers/repository.provider';
import { adminUtilityProviders } from './providers/utility.provider';
import { userServiceProvider } from './providers/service.provider';
import { AdminBookingController } from './controllers/bookings.controller';
import { ReviewController } from './controllers/reviews.controller';

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule, HttpModule],
  controllers: [AdminUserController, AdminApprovalsController, AdminBookingController, ReviewController],
  providers: [...userServiceProvider, ...adminRepositoryProviders, ...adminUtilityProviders],
})
export class AdminModule { }
