import { IsEmail, IsNotEmpty } from "class-validator";

export class InitialSignupDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}