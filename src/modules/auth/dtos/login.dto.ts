import { UserType } from '@core/entities/interfaces/user.entity.interface';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class EmailAndTypeDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  type: UserType;
}

export class AuthLoginDto extends EmailAndTypeDto {
  @MinLength(8)
  @IsString()
  password: string;
}

export class VerifyOtpForgotPassDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class LogoutDto {
  @IsNotEmpty()
  userType: UserType;
}

export class ChangePasswordDto extends AuthLoginDto { }

export class GoogleLoginDto {
  googleId: string;
  email: string;
  avatar?: string | undefined;
  name?: string;
  type: UserType;
}
