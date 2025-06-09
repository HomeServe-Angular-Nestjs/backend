import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';
import { AdminController } from './controllers/user.controller';
import { userServiceProvider } from './providers/service.provider';
import { adminUtilityProviders } from './providers/utility.provider';
import { adminRepositoryProviders } from './providers/repository.provider';

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule, HttpModule],
  controllers: [AdminController],
  providers: [...userServiceProvider, ...adminRepositoryProviders, ...adminUtilityProviders],
})
export class AdminModule { }
