import { BadRequestException, Query, Body, Controller, Get, Inject, InternalServerErrorException, Logger, Patch, UseInterceptors, Req, UnauthorizedException } from "@nestjs/common";
import { AuthInterceptor } from "../../auth/interceptors/auth.interceptor";
import { CUSTOMER_SERVICE_NAME } from "../../../core/constants/service.constant";
import { ICustomerService } from "../services/interfaces/customer-service.interface";
import { ICustomer } from "../../../core/entities/interfaces/user.entity.interface";
import { FilterDto } from "../dtos/customer.dto";
import { IPayload } from "../../../core/misc/payload.interface";
import { Request } from "express";

@Controller('')
export class CustomerController {
    private readonly logger = new Logger(CustomerController.name);

    constructor(
        @Inject(CUSTOMER_SERVICE_NAME)
        private readonly _customerService: ICustomerService
    ) { }

    @Get('customers')
    @UseInterceptors(AuthInterceptor)
    async getCustomers(@Query() filter: FilterDto) {
        try {
            return await this._customerService.getCustomers(filter);
        } catch (err) {
            this.logger.error(`Error fetching the customers: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed fetching the customers');
        }
    }

    @Get('customer')
    @UseInterceptors(AuthInterceptor)
    async fetchOneCustomer(@Req() req: Request): Promise<ICustomer | null> {
        try {
            const user = req.user as IPayload;
            if (!user || !user.sub) {
                throw new UnauthorizedException('User not found');
            }

            return await this._customerService.fetchOneCustomer(user.sub);
        } catch (err) {
            this.logger.error(`Error fetching the customers: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed fetching the customers');
        }
    }

    @Patch('partial_update')
    @UseInterceptors(AuthInterceptor)
    async partialUpdate(@Body() dto: Partial<ICustomer>): Promise<ICustomer> {
        try {
            const { id, ...updateData } = dto;
            if (!id) {
                throw new BadRequestException('customer7Id is not found in the request');
            }
            return this._customerService.partialUpdate(id, updateData);
        } catch (err) {
            this.logger.error(`Error updating customer: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to partially update the customer');
        }
    }
}