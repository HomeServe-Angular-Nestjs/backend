import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";
import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { ICustomerService } from "../interfaces/customer-service.interface";
import { ICustomer } from "../../../../core/entities/interfaces/user.entity.interface";
import { FilterDto } from "../../dtos/customer.dto";

@Injectable()
export class CustomerService implements ICustomerService {
    private readonly logger = new Logger(CustomerService.name);

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository
    ) { }

    /**
      * Retrieves all customers from the database.
      *
      * @returns {Promise<ICustomers[]>} List of all customer documents.
      */
    async getCustomers(filter: FilterDto): Promise<ICustomer[]> {
        const query: { [key: string]: any | string } = { isDeleted: false };

        if (filter?.search) {
            query.email = new RegExp(filter.search, 'i')
        }

        if (filter?.status && filter.status !== 'all') {
            query.isActive = filter.status
        }

        return await this._customerRepository.find(query);
    }

    async fetchOneCustomer(id: string): Promise<ICustomer | null> {
        return await this._customerRepository.findOne({ _id: id });
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