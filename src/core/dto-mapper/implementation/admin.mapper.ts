import { Types } from 'mongoose';

import { IAdminMapper } from '@core/dto-mapper/interface/admin.mapper.interface';
import { Admin } from '@core/entities/implementation/admin.entity';
import { IAdmin } from '@core/entities/interfaces/admin.entity.interface';
import { AdminDocument } from '@core/schema/admin.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminMapper implements IAdminMapper {
    toEntity(doc: AdminDocument): IAdmin {
        return new Admin({
            id: (doc._id as Types.ObjectId).toString(),
            email: doc.email,
            password: doc.password,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    toDocument(entity: Partial<IAdmin>): Partial<AdminDocument> {
        return {
            email: entity.email,
            password: entity.password,
        }
    }
}