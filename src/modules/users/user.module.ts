import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { userServiceProvider } from './providers/service.provider';
import { repositoryProvider } from '../auth/providers/repositories.provider';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';

@Module({
  imports: [JwtConfigModule],
  controllers: [UserController],
  providers: [...userServiceProvider, ...repositoryProvider],
})
export class UserModule {}
