import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CustomerDocument, CustomerSchema } from "src/auth/schema/customer.schema";
import { Customer } from "src/auth/common/entities/customer.entity";
import { BaseRepository } from "src/auth/common/repositories/implementations/base.repository";
import { Model } from "mongoose";
import { CUSTOMER_MODEL_NAME } from "src/auth/constants/model.constant";
import { ICustomerRepository } from "../interfaces/customer-repo.interface";

@Injectable()
export class CustomerRepository extends BaseRepository<Customer, CustomerDocument> implements ICustomerRepository {

    constructor(@InjectModel(CUSTOMER_MODEL_NAME) private customerModel: Model<CustomerDocument>) {
        super(customerModel);
    }

    protected toEntity(document: CustomerDocument): Customer {
        return new Customer({

        });
    }
}

