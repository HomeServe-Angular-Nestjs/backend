import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ICustomDtoValidator } from "../interface/custom-dto-validator.utility.interface";

@Injectable()
export class CustomDtoValidatorUtility implements ICustomDtoValidator {
    private readonly logger = new Logger(CustomDtoValidatorUtility.name);

    constructor() { }

    async validateDto<T extends object>(dtoClass: ClassConstructor<T>, payload: any): Promise<T> {
        const instance = plainToInstance(dtoClass, payload);
        const errors = await validate(instance);

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat();
            this.logger.error('Error validating dto: ', errorMessages);
            throw new BadRequestException(errorMessages);
        }
        return instance;
    }
}