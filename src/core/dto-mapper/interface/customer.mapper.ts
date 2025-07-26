import { ICustomer } from "@core/entities/interfaces/user.entity.interface";
import { CustomerDocument } from "@core/schema/customer.schema";

export interface ICustomerMapper {
    toEntity(doc: CustomerDocument): ICustomer;
}