import { Module } from '@nestjs/common';
import { AdminController } from './controllers/user.controller';
import { userServiceProvider } from './providers/service.provider';
import { repositoryProvider } from '../auth/providers/repositories.provider';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule],
  controllers: [AdminController],
  providers: [...userServiceProvider, ...repositoryProvider],
})
export class AdminModule {}
