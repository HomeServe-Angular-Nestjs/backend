import { Request } from 'express';
import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Put, Query, Req, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CUSTOMER_SERVICE_NAME } from '@core/constants/service.constant';
import { ICustomer, IFetchReviews } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { IPayload } from '@core/misc/payload.interface';
import { IResponse } from '@core/misc/response.util';
import { ChangePasswordDto, SubmitReviewDto, UpdateProfileDto, ProviderIdDto } from '@modules/customer/dtos/customer.dto';
import { ICustomerService } from '@modules/customer/services/interfaces/customer-service.interface';

@Controller('')
export class CustomerController {
    constructor(
        @Inject(CUSTOMER_SERVICE_NAME)
        private readonly _customerService: ICustomerService
    ) { }

    @Get('customer')
    async fetchOneCustomer(@Req() req: Request): Promise<ICustomer | null> {
        const user = req.user as IPayload;
        return await this._customerService.fetchOneCustomer(user.sub);
    }

    @Get('search_providers')
    async searchProvider(@Query() { search }: { search: string }): Promise<IResponse> {
        return this._customerService.searchProviders(search);
    }

    @Put('profile')
    async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto): Promise<IResponse<ICustomer>> {
        const user = req.user as IPayload;
        return await this._customerService.updateProfile(user.sub, updateProfileDto);
    }

    @Patch('partial_update')
    async partialUpdate(@Body() customerDto: Partial<ICustomer>): Promise<ICustomer> {
        const { id, ...updateData } = customerDto;
        if (!id) throw new UnauthorizedException({
            code: ErrorCodes.UNAUTHORIZED_ACCESS,
            message: ErrorMessage.UNAUTHORIZED_ACCESS
        });
        return this._customerService.partialUpdate(id, updateData);
    }

    @Patch('saved_providers')
    async updateSavedProviders(@Req() req: Request, @Body() providerIdDto: ProviderIdDto): Promise<ICustomer> {
        const user = req.user as IPayload;
        return this._customerService.updateSavedProviders(user.sub, providerIdDto);
    }

    @Patch('password')
    async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto): Promise<IResponse<ICustomer>> {
        const user = req.user as IPayload;
        return await this._customerService.changePassword(user.sub, dto);
    }

    @Patch('avatar')
    @UseInterceptors(FileInterceptor('customerAvatar'))
    async changeAvatar(@Req() req: Request, @Body() dto: any, @UploadedFile() file: Express.Multer.File) {
        const user = req.user as IPayload;

        if (!file) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.MISSING_FIELDS
            });
        }

        return await this._customerService.changeAvatar(user.sub, file);
    }

    @Get('gallery_images/:providerId')
    async getGalleryImages(@Param('providerId') providerId: string) {
        if (!providerId) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: ErrorMessage.MISSING_FIELDS
        });

        return await this._customerService.getProviderGalleryImages(providerId);
    }
}
