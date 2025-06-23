import { BadRequestException, Query, Body, Controller, Get, Inject, InternalServerErrorException, Logger, Patch, Req, UnauthorizedException, Post, Put } from "@nestjs/common";
import { CUSTOMER_SERVICE_NAME } from "../../../core/constants/service.constant";
import { ICustomerService } from "../services/interfaces/customer-service.interface";
import { ICustomer } from "../../../core/entities/interfaces/user.entity.interface";
import { ChangePasswordDto, UpdateProfileDto, UpdateSavedProvidersDto } from "../dtos/customer.dto";
import { IPayload } from "../../../core/misc/payload.interface";
import { Request } from "express";
import { IResponse } from "src/core/misc/response.util";
import { ErrorMessage } from "src/core/enum/error.enum";

@Controller('')
export class CustomerController {
    private readonly logger = new Logger(CustomerController.name);

    constructor(
        @Inject(CUSTOMER_SERVICE_NAME)
        private readonly _customerService: ICustomerService
    ) { }

    @Get('customer')
    async fetchOneCustomer(@Req() req: Request): Promise<ICustomer | null> {
        try {
            const user = req.user as IPayload;
            if (!user || !user.sub) {
                throw new UnauthorizedException('User not found');
            }

            return await this._customerService.fetchOneCustomer(user.sub);
        } catch (err) {
            this.logger.error(`Error fetching the customers: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('search_providers')
    async searchProvider(@Query() { search }: { search: string }): Promise<IResponse> {
        try {
            return this._customerService.searchProviders(search);
        } catch (err) {
            this.logger.error(`Error updating customer saved providers: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('profile')
    async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto): Promise<IResponse<ICustomer>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._customerService.updateProfile(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating customer profile: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('partial_update')
    async partialUpdate(@Body() dto: Partial<ICustomer>): Promise<ICustomer> {
        try {
            const { id, ...updateData } = dto;
            if (!id) {
                throw new BadRequestException('Id is is not found in the request');
            }

            return this._customerService.partialUpdate(id, updateData);
        } catch (err) {
            this.logger.error(`Error updating customer: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('saved_providers')
    async updateSavedProviders(@Req() req: Request, @Body() dto: UpdateSavedProvidersDto): Promise<ICustomer> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('customerId is not found in the request');
            }

            return this._customerService.updateSavedProviders(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating customer saved providers: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('password')
    async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto): Promise<IResponse<ICustomer>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('customerId is not found in the request');
            }

            return await this._customerService.changePassword(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating customer saved providers: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    // TODO - otp
    @Post('send_otp_sms')
    async sendOtp(@Req() req: Request, @Body() dto: { phone: string }) {
        const user = req.user as IPayload;
        if (!user.sub) {
            throw new UnauthorizedException('User not found');
        }

        this.logger.debug(dto);
        this._customerService.sendOtp(Number(dto.phone))
    }

}