import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { BookingSearchBy, BookingStatus, PaymentStatus } from '@core/enum/bookings.enum';
import { RatingSearchBy, RatingsSortBy } from '@core/enum/ratings.enum';
import { ReportCategoryType } from '@core/entities/interfaces/admin.entity.interface';
import { VerificationStatusType } from '@core/entities/interfaces/user.entity.interface';

export type FilterStatusType = true | false | 'all';
export type RoleType = 'customer' | 'provider';

export class PageDto {
  @IsOptional()
  @Transform(({ value }) => Number(value) || 1)
  @IsNumber()
  @Min(1)
  page: number;
}

export class GetUsersWithFilterDto extends PageDto {
  @IsNotEmpty()
  @IsIn(['customer', 'provider'], {
    message: 'Role must be either "customer" or "provider"',
  })
  role: RoleType;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'all') return 'all';
    return value;
  })
  @IsIn([true, false, 'all'])
  status: FilterStatusType;

  @IsOptional()
  @IsString()
  date: string;
}

export class StatusUpdateDto {
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsIn(['customer', 'provider'], {
    message: 'Role must be either "customer" or "provider"',
  })
  role: RoleType;
}

export class RemoveUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsIn(['customer', 'provider'], {
    message: 'Role must be either "customer" or "provider"',
  })
  role: RoleType;
}

export class AdminBookingFilterDto extends PageDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  @IsEnum(BookingSearchBy)
  searchBy: string;

  @IsOptional()
  @IsString()
  bookingStatus: BookingStatus;

  @IsOptional()
  @IsString()
  paymentStatus: PaymentStatus;
}

export class FilterWithPaginationDto extends PageDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return;
    const num = Number(value);
    if (isNaN(num)) return;
    return num;
  })
  minRating?: string;

  @IsOptional()
  @IsEnum(RatingsSortBy)
  sortBy?: RatingsSortBy;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RatingSearchBy)
  searchBy?: RatingSearchBy;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'all') return 'all';
    return value;
  })
  @IsIn([true, false, 'all'])
  status?: FilterStatusType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'all') return 'all';
    return value;
  })
  @IsIn([true, false, 'all'])
  isReported?: FilterStatusType;
}

export class LowestRatedQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value) || 5)
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class RatingTrendQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value) || 30)
  @IsNumber()
  @Min(1)
  days?: number;
}

export class UpdateReviewStatus {
  @IsNotEmpty()
  @IsString()
  reviewId: string;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

class ReportDownloadDto {
  @IsNotEmpty()
  @IsString()
  category: ReportCategoryType;

  @IsOptional()
  fromDate: string;

  @IsOptional()
  toDate: string;
}

export class BookingReportDownloadDto extends ReportDownloadDto {
  @IsOptional()
  userId: string;

  @IsOptional()
  status: string;
}

export class UserReportDownloadDto extends ReportDownloadDto {
  @IsOptional()
  @IsString()
  role: 'customer' | 'provider';

  @IsOptional()
  @IsIn(['active', 'blocked'])
  status: 'active' | 'blocked';
}

export class TransactionReportDownloadDto extends ReportDownloadDto {
  @IsOptional()
  @IsString()
  method: string;

  @IsOptional()
  @IsString()
  transactionType: string;
}

export class SettingsDto {
  @IsOptional()
  @IsNumber()
  gstPercentage: number;

  @IsOptional()
  @IsNumber()
  providerCommission: number;

  @IsOptional()
  @IsNumber()
  customerCommission: number;

  @IsOptional()
  @IsNumber()
  cancellationFee: number;

  @IsOptional()
  @IsNumber()
  providerCancellationFine: number;

  @IsOptional()
  @IsNumber()
  @Min(-1)
  defaultServiceLimit: number;
}

export class UpdateProviderVerificationDto {
  @IsNotEmpty()
  @IsString()
  providerId: string;

  @IsNotEmpty()
  @IsIn(['pending', 'verified', 'rejected'], {
    message: 'Verification status must be "pending", "verified" or "rejected"',
  })
  status: VerificationStatusType;
}
