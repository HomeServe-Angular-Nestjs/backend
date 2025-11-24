import { UserType } from "@core/entities/interfaces/user.entity.interface";
import { UserMapperMapType } from "@core/misc/mapper.type";
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