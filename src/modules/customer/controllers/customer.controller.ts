import { Request } from 'express';

import {
    BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Param, Patch,
    Post, Put, Query, Req, UnauthorizedException, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CUSTOMER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { ICustomer, IFetchReviews } from '../../../core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '../../../core/enum/error.enum';
import { ICustomLogger } from '../../../core/logger/interface/custom-logger.interface';
import {
    ILoggerFactory, LOGGER_FACTORY
} from '../../../core/logger/interface/logger-factory.interface';
import { IPayload } from '../../../core/misc/payload.interface';
import { IResponse } from '../../../core/misc/response.util';
import {
    ChangePasswordDto, SubmitReviewDto, UpdateProfileDto, UpdateSavedProvidersDto
} from '../dtos/customer.dto';
import { ICustomerService } from '../services/interfaces/customer-service.interface';

@Controller('')
export class CustomerController {
    private readonly logger: ICustomLogger;
    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CUSTOMER_SERVICE_NAME)
        private readonly _customerService: ICustomerService
    ) {
        this.logger = this.loggerFactory.createLogger(CustomerController.name);
    }

    @Get('customer')
    async fetchOneCustomer(@Req() req: Request): Promise<ICustomer | null> {
        try {
            const user = req.user as IPayload;
            if (!user || !user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
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
            this.logger.error(`Error fetching providers for search: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('search_services')
    async searchServices(@Query() { search }: { search: string }) {
        try {
            return this._customerService.searchServices(search);
        } catch (err) {
            this.logger.error(`Error fetching services for search: ${err.message}`, err.stack);
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
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
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
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
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
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._customerService.changePassword(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error updating customer saved providers: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('avatar')
    @UseInterceptors(FileInterceptor('customerAvatar'))
    async changeAvatar(@Req() req: Request, @Body() dto: any, @UploadedFile() file: Express.Multer.File) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            if (!file) {
                throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
            }

            return await this._customerService.changeAvatar(user.sub, file);

        } catch (err) {
            this.logger.error(`Error updating customer saved providers: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('reviews')
    async submitReview(@Req() req: Request, @Body() dto: SubmitReviewDto): Promise<IResponse<IFetchReviews>> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._customerService.submitReview(user.sub, dto);
        } catch (err) {
            this.logger.error(`Error submitting reviews for the provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('gallery_images/:providerId')
    async getGalleryImages(@Param('providerId') providerId: string) {
        try {
            if (!providerId) {
                throw new BadRequestException(ErrorMessage.MISSING_FIELDS, providerId);
            }

            return await this._customerService.getProviderGalleryImages(providerId);
        } catch (err) {
            this.logger.error(`Error fetching provider's gallery images: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
