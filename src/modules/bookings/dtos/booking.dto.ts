import { Transform, Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { BookingStatus, DateRange, PaymentStatus, SortBy } from "src/core/enum/bookings.enum";

export class SlotType {
    @IsString()
    @IsNotEmpty({ message: "'from' time is required" })
    from: string;

    @IsString()
    @IsNotEmpty({ message: "'to' time is required" })
    to: string;

    @IsOptional()
    @IsString({ message: "'takenBy' must be a string if provided" })
    takenBy?: string;
}

export class AddressType {
    @IsNotEmpty({ message: 'Address is required' })
    @IsString()
    address: string;

    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true, message: 'Coordinates must be numbers' })
    coordinates: [number, number];
}

export class SelectedServiceType {
    @IsString()
    id: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    selectedIds: string[];
}

export class SlotDataType {
    @IsString()
    @IsNotEmpty({ message: "'scheduleId' is required" })
    scheduleId: string;

    @IsString()
    @IsNotEmpty({ message: "'slotId' is required" })
    slotId: string;
}

export class SelectedServiceDto {
    @IsNotEmpty()
    @IsString()
    serviceId: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    subServiceIds: string[];
};

export class IPriceBreakupDto {
    @IsNumber()
    subTotal: number;

    @IsNumber()
    tax: number;

    @IsNumber()
    visitingFee: number;

    @IsNumber()
    total: number;
}

export class BookingDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;

    @IsNotEmpty()
    @IsNumber()
    total: number;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => SlotDataType)
    slotData: SlotDataType;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => AddressType)
    location: AddressType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SelectedServiceType)
    serviceIds: SelectedServiceType[]
}


export class BookingPaginationFilterDto {
    @IsOptional()
    @Transform(({ value }) => Number(value) || 1)
    @IsNumber()
    @Min(1)
    page: number;

    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsEnum(DateRange, {
        message: 'dateRange must be one of: ' + Object.values(DateRange).join(', ')
    })
    date: DateRange;

    @IsOptional()
    @IsEnum(SortBy, {
        message: 'sortBy must be one of: ' + Object.values(SortBy).join(', ')
    })
    sort: SortBy;

    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsEnum(BookingStatus, {
        message: 'bookingStatus must be one of: ' + Object.values(BookingStatus).join(', ')
    })
    bookingStatus?: BookingStatus;

    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    @IsEnum(PaymentStatus, {
        message: 'paymentStatus must be one of: ' + Object.values(PaymentStatus).join(', ')
    })
    paymentStatus?: PaymentStatus;

}

export type FilterFileds = Omit<BookingPaginationFilterDto, 'page'>;

export class ViewBookingDetailsDto {
    @IsNotEmpty()
    @IsString()
    bookingId: string;
}

