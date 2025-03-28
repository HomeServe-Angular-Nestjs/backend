import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class InitiateSignupDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    type: string;
}