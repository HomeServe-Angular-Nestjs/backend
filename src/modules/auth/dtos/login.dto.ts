import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export type UserType = 'customer' | 'provider' | 'admin';

export class  AuthLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsString()
  password: string;

  @IsNotEmpty()
  type: UserType;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  type: UserType;
}

export class VerifyTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
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
