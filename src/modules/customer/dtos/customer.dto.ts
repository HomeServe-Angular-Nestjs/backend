import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDefined, IsEmail, IsNotEmpty, IsString, Matches, ValidateNested } from "class-validator";

export class UpdateSavedProvidersDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;
}

export class AddressDto {
    @IsDefined()
    @IsString()
    address: string;

    @IsDefined()
    @IsArray()
    @ArrayMinSize(2)
    coordinates: [number, number];
}

export class UpdateProfileDto {
    @IsDefined()
    @IsString()
    fullname: string;

    @IsDefined()
    @IsString()
    username: string;

    @IsDefined()
    @IsString()
    @IsEmail()
    email: string;

    @IsDefined()
    @IsString()
    @Matches(/^[6-9]\d{9}$/, {
        message: 'Invalid phone number'
    })
    phone: string;

    @IsDefined()
    @ValidateNested()
    @Type(() => AddressDto)
    location: AddressDto
}

export class ChangePasswordDto {
    @IsDefined()
    @IsString()
    currentPassword: string;

    @IsDefined()
    @IsString()
    newPassword: string;
}