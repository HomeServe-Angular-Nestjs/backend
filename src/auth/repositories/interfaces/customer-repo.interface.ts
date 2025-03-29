import { Customer } from "src/auth/common/entities/implementation/customer.entity";
import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";
import { ChangePasswordDto } from "src/auth/dtos/login.dto";
import { CustomerDocument } from "src/auth/schema/customer.schema";

export interface ICustomerRepository extends IBaseRepository<Customer, CustomerDocument> { }