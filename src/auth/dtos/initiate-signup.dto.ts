import { IsEmail, IsNotEmpty } from "class-validator";

export class InitiateSignupDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}