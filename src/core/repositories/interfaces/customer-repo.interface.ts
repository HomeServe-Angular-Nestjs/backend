import { Customer } from "../../entities/implementation/customer.entity";
import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { CustomerDocument } from "../../schema/customer.schema";

export interface ICustomerRepository extends IBaseRepository<Customer, CustomerDocument> { }