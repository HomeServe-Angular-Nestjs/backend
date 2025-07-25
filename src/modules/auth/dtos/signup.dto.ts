import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

type UserType = 'customer' | 'provider';

export class InitiateSignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  type: UserType;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(4, 4)
  code: string;
}

export class CompleteSignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  type: UserType;
}
