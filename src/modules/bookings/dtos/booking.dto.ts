import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SelectedServiceDto {
    @IsNotEmpty()
    @IsString()
    serviceId: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    subServiceIds: string[];
};

export class IPriceBreakupData {
    @IsNumber()
    subTotal: number;

    @IsNumber()
    tax: number;

    @IsNumber()
    visitingFee: number;

    @IsNumber()
    total: number;
}