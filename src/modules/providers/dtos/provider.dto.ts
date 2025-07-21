import { Optional } from "@nestjs/common";
import { Transform, Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDefined, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { UploadsType } from "src/core/enum/uploads.enum";


export type FilterStatusType = true | false | 'all';

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

export class FilterDto {
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
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isCertified: boolean;
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
    @Optional()
    @IsString()
    providerBio?: string;

    @Optional()
    @ValidateNested({ each: true })
    @Type(() => ExpertiseDto)
    expertises?: ExpertiseDto[];

    @Optional()
    @IsString({ each: true })
    additionalSkills?: string[];

    @Optional()
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

export class GetProvidersFromLocationSearch {
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => {
        if (!value) return null;
        const num = Number(value);

        if (isNaN(num)) {
            throw new Error('Invalid coordinates format. Expected as number.');
        }
        return num;
    })
    lng: number;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => {
        if (!value) return null;
        const num = Number(value);

        if (isNaN(num)) {
            throw new Error('Invalid coordinates format. Expected as number.');
        }
        return num;
    })
    lat: number;

    @IsNotEmpty()
    @IsString()
    title: string;
}

export class UploadGalleryImageDto {
    @IsNotEmpty()
    @IsIn(Object.values(UploadsType))
    type: UploadsType;
}