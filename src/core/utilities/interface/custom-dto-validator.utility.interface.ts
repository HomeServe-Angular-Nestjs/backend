import { ClassConstructor } from 'class-transformer';

export interface ICustomDtoValidator {
    validateDto<T extends object>(dtoClass: ClassConstructor<T>, payload: any): Promise<T>;
}