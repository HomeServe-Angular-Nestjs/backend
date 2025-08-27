import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize, IsArray, IsDefined, IsEmail, IsNotEmpty, IsNumber, IsString, Matches, Max, Min,
    ValidateNested
} from 'class-validator';

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
    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[6-9]\d{9}$/, {
        message: 'Invalid phone number'
    })
    phone: string;

    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @Type(() => Number)
    @IsNumber({}, { each: true })
    coordinates: number[];

    @IsNotEmpty()
    @IsString()
    address: string;
}

export class ChangePasswordDto {
    @IsDefined()
    @IsString()
    currentPassword: string;

    @IsDefined()
    @IsString()
    newPassword: string;
}

export class SubmitReviewDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;

    @IsNotEmpty()
    @IsString()
    desc: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5)
    ratings: number;
}