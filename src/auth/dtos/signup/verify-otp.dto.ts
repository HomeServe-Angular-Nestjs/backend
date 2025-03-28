import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyOtpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Length(4, 4)
    code: string;
}