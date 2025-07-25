import { JwtConfigModule } from '@configs/jwt/jwt.module';
import { RedisModule } from '@configs/redis/redis.module';
import { LoginController } from '@modules/auth/controllers/login.controller';
import { SignUpController } from '@modules/auth/controllers/signup.controller';
import { repositoryProvider } from '@modules/auth/providers/repositories.provider';
import { serviceProvider } from '@modules/auth/providers/service.provider';
import { utilityProvider } from '@modules/auth/providers/utility.provider';
import { GoogleStrategy } from '@modules/auth/strategies/google.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    JwtConfigModule,
    RedisModule,
    SharedModule
  ],
  controllers: [SignUpController, LoginController],
  providers: [
    ...repositoryProvider,
    ...serviceProvider,
    ...utilityProvider,
    GoogleStrategy,
  ],
  exports: [],
})
export class AuthModule { }
