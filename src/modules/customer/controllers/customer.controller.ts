import { BadRequestException, Query, Body, Controller, Get, Inject, InternalServerErrorException, Logger, Patch, UseInterceptors, Req, UnauthorizedException, Post } from "@nestjs/common";

import { CUSTOMER_SERVICE_NAME } from "../../../core/constants/service.constant";
import { ICustomerService } from "../services/interfaces/customer-service.interface";
import { ICustomer } from "../../../core/entities/interfaces/user.entity.interface";
import { UpdateSavedProvidersDto } from "../dtos/customer.dto";
import { IPayload } from "../../../core/misc/payload.interface";
import { Request } from "express";
import { dot } from "node:test/reporters";

@Controller('')
export class CustomerController {
    private readonly logger = new Logger(CustomerController.name);

    constructor(
        @Inject(CUSTOMER_SERVICE_NAME)
        private readonly _customerService: ICustomerService
    ) { }

    @Get('customer')
    //@UseInterceptors()
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
    //@UseInterceptors()
    async partialUpdate(@Body() dto: Partial<ICustomer>): Promise<ICustomer> {
        try {
            const { id, ...updateData } = dto;
            if (!id) {
                throw new BadRequestException('Id is is not found in the request');
            }

            return this._customerService.partialUpdate(id, updateData);
        } catch (err) {
            this.logger.error(`Error updating customer: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to partially update the customer');
        }
    }

    @Patch('saved_providers')
    //@UseInterceptors()
    async updateSavedProviders(@Req() req: Request, @Body() dto: UpdateSavedProvidersDto): Promise<ICustomer> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('customerId is not found in the request');
            }

            return this._customerService.updateSavedProviders(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating customer saved providers: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update the customer saved providers');
        }
    }

    @Post('send_otp_sms')
    //@UseInterceptors()
    async sendOtp(@Req() req: Request, @Body() dto: { phone: string }) {
        const user = req.user as IPayload;
        if (!user.sub) {
            throw new UnauthorizedException('User not found');
        }

        this.logger.debug(dto);
        this._customerService.sendOtp(Number(dto.phone))
    }
}