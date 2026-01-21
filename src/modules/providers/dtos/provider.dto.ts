import { Transform, Type } from 'class-transformer';
import { IsDefined, IsIn, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UploadsType } from '@core/enum/uploads.enum';
import { FilterStatusType } from '@core/entities/interfaces/user.entity.interface';
import { AvailabilityEnum } from '@core/enum/slot.enum';

export class SlotDto {
    @IsNotEmpty()
    @IsString()
    from: string;

    @IsNotEmpty()
    @IsString()
    to: string;
}

export class UpdateDefaultSlotsDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => SlotDto)
    slot: SlotDto;
}

export class PageDto {
    @Transform(({ value }) => {
        const page = Number(value);
        return Number.isFinite(page) && page > 0 ? page : 1;
    })
    @IsNumber()
    page: number;

    @Transform(({ value }) => {
        const limit = Number(value);
        return Number.isFinite(limit) && limit > 0 ? limit : 10;
    })
    @IsNumber()
    limit: number;
}

export class FilterDto extends PageDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    @IsIn(['nearest', 'all', 'best-rated'])
    status: FilterStatusType;

    @IsOptional()
    @IsString()
    @IsIn([...Object.values(AvailabilityEnum), 'all'])
    availability?: AvailabilityEnum | 'all';

    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @Transform(({ value }) => value ? Number(value) : null)
    @IsOptional()
    // @IsNumber()
    lat: number | null;

    @Transform(({ value }) => value ? Number(value) : null)
    @IsOptional()
    // @IsNumber()
    lng: number | null;
}

class ExpertiseDto {
    @IsDefined()
    @IsString()
    specialization: string;

    @IsDefined()
    @IsString()
    label: string;
};


class LanguageDto {
    @IsDefined()
    @IsString()
    language: string;

    @IsDefined()
    @IsString()
    proficiency: string;
}

export class UpdateBioDto {
    @IsOptional()
    @IsString()
    providerBio?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ExpertiseDto)
    expertise?: ExpertiseDto[];

    @IsOptional()
    @IsString({ each: true })
    additionalSkills?: string[];

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => LanguageDto)
    languages?: LanguageDto[];
}

export class UploadCertificateDto {
    @IsDefined()
    @IsString()
    label: string;
}

export class RemoveCertificateDto {
    @IsDefined()
    @IsString()
    docId: string;
}

export class UploadGalleryImageDto {
    @IsNotEmpty()
    @IsIn(Object.values(UploadsType))
    type: UploadsType;
}

export class GetReviewsDto {
    @IsNotEmpty()
    @IsString()
    providerId: string;

    @IsNumber()
    count: number;
}

export class UpdatePasswordDto {
    @IsNotEmpty()
    @IsString()
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    currentPassword: string;
}

export class UpdateBufferTimeDto {
    @IsNotEmpty()
    @IsNumber()
    bufferTime: number;
}
