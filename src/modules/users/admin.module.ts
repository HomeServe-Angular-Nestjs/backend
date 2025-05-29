import { Module } from '@nestjs/common';
import { AdminController } from './controllers/user.controller';
import { userServiceProvider } from './providers/service.provider';
import { repositoryProvider } from '../auth/providers/repositories.provider';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';
import { HttpModule } from '@nestjs/axios';
import { adminUtilityProviders } from './providers/utility.provider';

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule, HttpModule],
  controllers: [AdminController],
  providers: [...userServiceProvider, ...repositoryProvider, ...adminUtilityProviders],
})
export class AdminModule { }
