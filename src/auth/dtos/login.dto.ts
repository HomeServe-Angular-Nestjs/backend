import { IsEmail, IsNotEmpty, IsString, MinLength, } from "class-validator";

type UserType = 'customer' | 'provider';

export class AuthLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @MinLength(8)
    @IsString()
    password: string

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

export class ChangePasswordDto extends AuthLoginDto { }
