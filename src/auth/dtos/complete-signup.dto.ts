import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CompleteSignupDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(6)
    password: string;
}