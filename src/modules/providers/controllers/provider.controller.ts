import { Request } from 'express';
import { PROVIDER_SERVICE_NAME } from '@core/constants/service.constant';
import { IProvider } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { IPayload } from '@core/misc/payload.interface';
import { BadRequestException, Body, Controller, Delete, Get, Inject, InternalServerErrorException, Param, Patch, Put, Query, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterDto, GetProvidersFromLocationSearch, GetReviewsDto, RemoveCertificateDto, SlotDto, UpdateBioDto, UploadCertificateDto, UploadGalleryImageDto } from '../dtos/provider.dto';
import { IProviderServices } from '../services/interfaces/provider-service.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { SubscriptionGuard } from '@core/guards/subscription.guard';
import { IResponse } from '@core/misc/response.util';
import { isValidIdPipe } from '@core/pipes/is-valid-id.pipe';

@Controller('provider')
export class ProviderController {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(PROVIDER_SERVICE_NAME)
        private readonly _providerServices: IProviderServices,
        
    ) {
        this.logger = this._loggerFactory.createLogger(ProviderController.name);
    }

    @Get('fetch_providers')
    async fetchProviders(@Query() dto: FilterDto & GetProvidersFromLocationSearch) {
        const { lat, lng, title, ...filter } = dto;

        if (lat && lng && title) {
            const locationSearch = { lat, lng, title };
            return await this._providerServices.getProvidersLocationBasedSearch(locationSearch);
        } else {
            return await this._providerServices.getProviders(filter);
        }
    }

    @Get('fetch_one_provider')
    async fetchOneProvider(@Req() req: Request, @Query() query: { id: string | null }): Promise<IProvider> {
        const user = req.user as IPayload;
        let id = user.sub;

        if (query && query.id !== null && query.id !== 'null') {
            id = query.id;
        }

        return await this._providerServices.fetchOneProvider(id);
    }

    @Get('reviews')
    async getReviews(@Query() dto: GetReviewsDto) {
        return await this._providerServices.getReviews(dto.providerId, dto.count);
    }

    @Put('bio')
    async updateBio(@Req() req: Request, @Body() dto: UpdateBioDto) {
        const user = req.user as IPayload;
        return await this._providerServices.updateBio(user.sub, dto);
    }

    @Put('cert_upload')
    @UseInterceptors(FileInterceptor('doc'))
    async uploadCertificate(@Req() req: Request, @Body() { label }: UploadCertificateDto, @UploadedFile() file: Express.Multer.File) {
        const user = req.user as IPayload;

        if (!label || !file) {
            throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
        }

        return await this._providerServices.uploadCertificate(user.sub, label, file);
    }

    // Performs a bulk update of provider data, including optional avatar upload.
    @Patch('update_provider')
    @UseInterceptors(FileInterceptor('providerAvatar'))
    async bulkUpdateProvider(
        @Req() req: Request,
        @Body('providerData') dto: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IProvider> {
        const user = req.user as IPayload;
        const updateData = JSON.parse(dto);

        return await this._providerServices.bulkUpdateProvider(user.sub, updateData, file);
    }

    @Patch('partial_update')
    async partialUpdate(@Body() dto: Partial<IProvider>): Promise<IProvider> {
        const { id, ...updateData } = dto;
        if (!id) {
            throw new BadRequestException('Id is is not found in the request');
        }

        return this._providerServices.partialUpdate(id, updateData);
    }

    @Patch('default_slots') //!TODO
    async updateDefaultSlot(@Req() req: Request, @Body() dto: SlotDto): Promise<IProvider> {
        const user = req.user as IPayload;
        return await this._providerServices.updateDefaultSlot(dto, user.sub)
    }

    @Patch('cert_remove') //!TODO
    @UseInterceptors(FileInterceptor('doc'))
    async removeCertificate(@Req() req: Request, @Body() { docId }: RemoveCertificateDto) {
        const user = req.user as IPayload;
        if (!docId) {
            throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
        }
        // return await this._providerServices.uploadCertificate(user.sub, label, file);
    }

    @Get('work_images')
    @UseGuards(SubscriptionGuard)
    async getWorkImage(@Req() req: Request) {
        const user = req.user as IPayload;
        return await this._providerServices.getWorkImages(user.sub);
    }

    @Patch('gallery_upload')
    @UseInterceptors(FileInterceptor('gallery_image'))
    async uploadWorkImage(@Req() req: Request, @Body() dto: UploadGalleryImageDto, @UploadedFile() file: Express.Multer.File) {
        const user = req.user as IPayload;
        return await this._providerServices.uploadWorkImage(user.sub, user.type, dto.type, file);
    }

}
