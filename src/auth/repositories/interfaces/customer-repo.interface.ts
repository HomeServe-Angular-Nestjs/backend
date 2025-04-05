import { Customer } from "../../common/entities/implementation/customer.entity";
import { IBaseRepository } from "../../common/repositories/interfaces/base-repo.interface";
import { ChangePasswordDto } from "../../dtos/login.dto";
import { CustomerDocument } from "../../schema/customer.schema";

export interface ICustomerRepository extends IBaseRepository<Customer, CustomerDocument> { }