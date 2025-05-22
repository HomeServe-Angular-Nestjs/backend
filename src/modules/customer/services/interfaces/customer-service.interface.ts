import { ICustomer } from "../../../../core/entities/interfaces/user.entity.interface";
import { FilterDto } from "../../dtos/customer.dto";

export interface ICustomerService {
    getCustomers(filter?: FilterDto): Promise<ICustomer[]>;
    fetchOneCustomer(id: string): Promise<ICustomer | null>;
    partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer>;
}