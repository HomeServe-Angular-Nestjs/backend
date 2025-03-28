import { IsEmail, IsNotEmpty, IsString, MinLength, } from "class-validator";

export class AuthLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @MinLength(8)
    @IsString()
    password: string

    @IsNotEmpty()
    type: string;
}