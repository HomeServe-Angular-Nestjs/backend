import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProviderIdDto {
  @IsNotEmpty({ message: 'providerId is required' })
  @IsString({ message: 'providerId must be a string' })
  providerId: string;
}

export class CustomerIdDto {
  @IsNotEmpty({ message: 'customerId is required' })
  @IsString({ message: 'customerId must be a string' })
  customerId: string;
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
  @MinLength(4, { message: 'Full name must be at least 4 characters.' })
  @MaxLength(50, { message: 'Full name cannot exceed 50 characters.' })
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters.' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Invalid phone number',
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
