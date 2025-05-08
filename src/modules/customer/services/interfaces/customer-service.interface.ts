import { ICustomer } from "../../../../core/entities/interfaces/user.entity.interface";

export interface ICustomerService {
    partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer>;
}