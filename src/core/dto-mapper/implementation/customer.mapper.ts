import { ICustomerMapper } from "@core/dto-mapper/interface/customer.mapper";
import { Customer } from "@core/entities/implementation/customer.entity";
import { ICustomer } from "@core/entities/interfaces/user.entity.interface";
import { CustomerDocument } from "@core/schema/customer.schema";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CustomerMapper implements ICustomerMapper {
    toEntity(doc: CustomerDocument): ICustomer {
        return new Customer({
            id: doc.id,
            email: doc.email,
            username: doc.username,
            avatar: doc.avatar,
            password: doc?.password,
            googleId: doc?.googleId,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            fullname: doc?.fullname,
            isDeleted: doc.isDeleted,
            savedProviders: doc.savedProviders,
            phone: doc.phone,
            location: doc.location,
            isReviewed: doc.isReviewed,
            address: doc.address,
        });
    }
}