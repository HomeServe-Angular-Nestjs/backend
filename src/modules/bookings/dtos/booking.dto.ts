import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsDate, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
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
    total: number;
}

export class SaveBookingDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;

    @IsNotEmpty()
    @IsString()
    date: string;

    @IsNotEmpty()
    @IsString()
    to: string;

    @IsNotEmpty()
    @IsString()
    from: string;
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
    @Type(() => Date)
    @IsDate()
    date?: Date;

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

export class CancelBookingDto extends BookingIdDto {
    @IsNotEmpty()
    @IsString({ message: 'Reason must be a string.' })
    @Matches(/^[A-Za-z0-9 ,.!?-]+$/, { message: 'Enter a valid reason.' })
    @MinLength(10, { message: 'Minimum length should be 10 characters.' })
    @MaxLength(100, { message: 'Maximum length should be 100 characters.' })
    @Transform(({ value }) => {
        const trimmed = value?.trim();
        return !trimmed ? undefined : trimmed;
    })
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

export class UpdateBookingPaymentStatusDto {
    @IsNotEmpty()
    @IsString()
    bookingId: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(PaymentStatus))
    paymentStatus: PaymentStatus;

    @IsNotEmpty()
    @IsString()
    transactionId: string;
}

export class AddReviewDto {
    @IsNotEmpty()
    @IsString()
    bookingId: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    ratings: number;
}

export class ReviewFilterDto {
    @Transform(({ value }) => Number(value) || 1)
    @IsNumber()
    page: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['all', 1, 2, 3, 4, 5], {
        message: 'rating must be all or 1–5'
    })
    @Transform(({ value }) => value === 'all' ? 'all' : Number(value))
    rating?: 'all' | 1 | 2 | 3 | 4 | 5;

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sort?: 'asc' | 'desc';

    @IsOptional()
    @IsIn(['all', 'last_6_months', 'last_year'])
    time?: 'all' | 'last_6_months' | 'last_year';
}

export class UpdateBookingStatusDto {
    @IsNotEmpty()
    @IsIn(Object.values(BookingStatus))
    newStatus: BookingStatus
}

export class CancelReasonDto {
    @IsOptional()
    @IsString({ message: 'Reason must be a string.' })
    @Matches(/^[A-Za-z0-9 ,.!?-]+$/, { message: 'Enter a valid reason.' })
    @MinLength(10, { message: 'Minimum length should be 10 characters.' })
    @MaxLength(100, { message: 'Maximum length should be 100 characters.' })
    @Transform(({ value }) => {
        const trimmed = value?.trim();
        return !trimmed ? undefined : trimmed;
    })
    reason?: string;
}
