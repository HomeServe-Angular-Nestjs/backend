import { Provider } from "../../../../core/entities/implementation/provider.entity";
import { Customer } from "../../../../core/entities/implementation/customer.entity";

export interface IUserService {
    getCustomer(): Promise<Customer[]>;
    getProviders(): Promise<Provider[]>;
}