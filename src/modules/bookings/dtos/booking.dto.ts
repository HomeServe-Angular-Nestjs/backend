import { Transform, Type } from 'class-transformer';
import {
    ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber,
    IsOptional, IsString, Min, ValidateNested
} from 'class-validator';

import { BookingStatus, DateRange, PaymentStatus, SortBy } from '@core/enum/bookings.enum';

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
    @IsDefined({ message: "'scheduleId' is required" })
    scheduleId: string;

    @IsString()
    @IsDefined({ message: "'slotId' is required" })
    slotId: string;

    @IsString()
    @IsDefined({ message: "'dayId' is required" })
    dayId: string;

    @IsString()
    @IsDefined({ message: "'month' is required" })
    month: string;
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
    serviceIds: SelectedServiceType[];

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value : null)
    transactionId: string | null;
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

export type FilterFields = Omit<BookingPaginationFilterDto, 'page'>;

export class BookingIdDto {
    @IsNotEmpty()
    @IsString()
    bookingId: string;
}


export class UpdateBookingStatusDto {
    @IsNotEmpty()
    @IsString()
    bookingId: string;

    @IsNotEmpty()
    @IsString()
    newStatus: string;
}


export class CancelBookingDto extends BookingIdDto {
    @IsNotEmpty()
    @IsString()
    reason: string
}


export class UpdateBookingDto {
    @IsNotEmpty()
    @IsString()
    bookingId: string;

    @IsOptional()
    @IsString()
    transactionId: string;
}