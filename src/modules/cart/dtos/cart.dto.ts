import { IsNotEmpty, IsString } from 'class-validator';

export class ProviderServiceIdDto {
    @IsNotEmpty()
    @IsString()
    providerServiceId: string;
}

export class UpdateCartItemsDto extends ProviderServiceIdDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;
}

