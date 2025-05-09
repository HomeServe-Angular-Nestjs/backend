import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";
import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { ICustomerService } from "../interfaces/customer-service.interface";
import { ICustomer } from "../../../../core/entities/interfaces/user.entity.interface";
import { FilterDto } from "../../dtos/customer.dto";

@Injectable()
export class CustomerService implements ICustomerService {
    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository
    ) { }


    async getCustomers(filter: FilterDto): Promise<ICustomer[]> {
        const query: { [key: string]: any | string } = { isDeleted: false };

        if (filter.search) {
            query.email = new RegExp(filter.search, 'i')
        }

        return await this._customerRepository.find(query);
    }

    /**
   * Partially updates customer information.
   *
   * @param {string} id - The customer's unique ID.
   * @param {Partial<ICustomer>} data - The fields to update.
   * @returns {Promise<ICustomer>} The updated customer document.
   * @throws {NotFoundException} If the customer is not found.
   */
    async partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer> {
        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: id },
            { $set: data },
        );

        if (!updatedCustomer) {
            throw new NotFoundException(`Customer with Id ${id} is not found`)
        }

        return updatedCustomer;
    }

}