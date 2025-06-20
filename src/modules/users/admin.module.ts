import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { AdminApprovalsController } from './controllers/approvals.controller';
import { AdminUserController } from './controllers/user.controller';
import { adminRepositoryProviders } from './providers/repository.provider';
import { adminUtilityProviders } from './providers/utility.provider';
import { userServiceProvider } from './providers/service.provider';

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule, HttpModule],
  controllers: [AdminUserController, AdminApprovalsController],
  providers: [...userServiceProvider, ...adminRepositoryProviders, ...adminUtilityProviders],
})
export class AdminModule { }
