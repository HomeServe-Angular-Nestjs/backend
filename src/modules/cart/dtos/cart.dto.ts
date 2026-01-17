import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCartItemsDto {
    @IsNotEmpty()
    @IsString()
    providerServiceId: string;

    @IsNotEmpty()
    @IsString()
    providerId: string;
}

