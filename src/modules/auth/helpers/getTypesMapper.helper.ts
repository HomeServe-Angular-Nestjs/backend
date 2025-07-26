import { UserMapperMapType } from "@core/misc/mapper.type";
import { UserType } from "@modules/auth/dtos/login.dto";
import { BadRequestException } from "@nestjs/common";

export function getTypedMapperHelper<T extends UserType>(
    type: T,
    mappers: UserMapperMapType
): UserMapperMapType[T] {
    switch (type) {
        case 'customer':
            return mappers.customer as UserMapperMapType[T];
        case 'provider':
            return mappers.provider as UserMapperMapType[T];
        case 'admin':
            return mappers.admin as UserMapperMapType[T];
        default:
            throw new BadRequestException('Invalid type Error.');
    }
}