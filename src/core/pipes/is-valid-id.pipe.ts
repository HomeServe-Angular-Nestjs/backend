import { ErrorMessage } from "@core/enum/error.enum";
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class isValidIdPipe implements PipeTransform {
    transform(value: any, metaData: ArgumentMetadata) {
        const variableName = metaData.data;

        if (!value.trim()) {
            throw new BadRequestException(`${variableName} ${ErrorMessage.SHOULD_NOT_BE_EMPTY}`);
        }

        if (typeof value !== 'string') {
            throw new BadRequestException(`${variableName} ${ErrorMessage.MUST_BE_STRING}`);
        }

        return value;
    }
}