import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ICustomLogger } from '../../logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '../../logger/interface/logger-factory.interface';
import { ICustomDtoValidator } from '../interface/custom-dto-validator.utility.interface';

@Injectable()
export class CustomDtoValidatorUtility implements ICustomDtoValidator {
    private readonly logger: ICustomLogger

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
    ) {
        this.logger = this._loggerFactory.createLogger(CustomDtoValidatorUtility.name);
    }

    async validateDto<T extends object>(dtoClass: ClassConstructor<T>, payload: any): Promise<T> {
        const instance = plainToInstance(dtoClass, payload);
        const errors = await validate(instance);

        if (errors.length > 0) {
            const errorMessages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat();
            this.logger.error('Error validating dto: ' + errorMessages.join(', '));
            throw new BadRequestException(errorMessages);
        }
        return instance;
    }
}
