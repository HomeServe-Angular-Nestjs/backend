import { Customer } from "src/auth/common/entities/customer.entity";
import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";

export interface ICustomerRepository extends IBaseRepository<Customer> {
    findByEmail(email: string): Promise<Customer | null>;

}