import { Optional } from "@nestjs/common";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDefined, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";


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