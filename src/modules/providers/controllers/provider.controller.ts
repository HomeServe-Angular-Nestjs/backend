import { BadRequestException, Body, Controller, Get, Inject, Patch, Put, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilterDto, GetProvidersFromLocationSearch, GetReviewsDto, RemoveCertificateDto, SlotDto, UpdateBioDto, UpdatePasswordDto, UploadCertificateDto, UploadGalleryImageDto } from '@modules/providers/dtos/provider.dto';
import { Request } from 'express';
import { PROVIDER_SERVICE_NAME } from '@core/constants/service.constant';
import { IProvider } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { IPayload } from '@core/misc/payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IResponse } from '@core/misc/response.util';
import { IProviderServices } from '@modules/providers/services/interfaces/provider-service.interface';

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

    private _getUser(req: Request): IPayload {
        return req.user as IPayload;
    }

    @Get('fetch_providers')
    async fetchProviders(@Req() req: Request, @Query() providerLocationWithFilterDto: FilterDto & GetProvidersFromLocationSearch) {
        const user = this._getUser(req);
        const { lat, lng, title, page, ...filter } = providerLocationWithFilterDto;

        if (lat && lng && title) {
            const locationSearch = { lat, lng, title };
            return await this._providerServices.getProvidersLocationBasedSearch({ ...locationSearch, page: Number(page) });
        } else {
            return await this._providerServices.getProviders(user.sub, { ...filter, page: Number(page) });
        }
    }

    @Get('fetch_one_provider')
    async fetchOneProvider(@Req() req: Request, @Query() query: { providerId: string | null }): Promise<IProvider> {
        const user = this._getUser(req);
        let userId = user.sub;

        if (query && query.providerId !== null && query.providerId !== 'null') {
            userId = query.providerId;
        }
        return await this._providerServices.fetchOneProvider(userId);
    }

    @Get('reviews')
    async getReviews(@Query() getReviewsDto: GetReviewsDto) {
        return await this._providerServices.getReviews(getReviewsDto.providerId, getReviewsDto.count);
    }

    @Put('bio')
    async updateBio(@Req() req: Request, @Body() updateBioDto: UpdateBioDto) {
        const user = this._getUser(req);
        return await this._providerServices.updateBio(user.sub, updateBioDto);
    }

    @Put('cert_upload')
    @UseInterceptors(FileInterceptor('doc'))
    async uploadCertificate(@Req() req: Request, @Body() { label }: UploadCertificateDto, @UploadedFile() file: Express.Multer.File) {
        const user = this._getUser(req);

        if (!label || !file) {
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.MISSING_FIELDS
            });
        }

        return await this._providerServices.uploadCertificate(user.sub, label, file);
    }

    // Performs a bulk update of provider data, including optional avatar upload.
    @Patch('update_provider')
    @UseInterceptors(FileInterceptor('providerAvatar'))
    async bulkUpdateProvider(@Req() req: Request, @Body('providerData') providerDetailsDto: string, @UploadedFile() file: Express.Multer.File,): Promise<IProvider> {
        const user = this._getUser(req);
        const updateData = JSON.parse(providerDetailsDto);

        return await this._providerServices.bulkUpdateProvider(user.sub, updateData, file);
    }

    @Patch('partial_update')
    async partialUpdate(@Body() providerDto: Partial<IProvider>): Promise<IProvider> {
        const { id, ...updateData } = providerDto;
        if (!id) {
            this.logger.error('provider id is missing.');
            throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.MISSING_FIELDS
            });
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
    async getWorkImage(@Req() req: Request) {
        const user = this._getUser(req);
        return await this._providerServices.getWorkImages(user.sub);
    }

    @Patch('gallery_upload')
    @UseInterceptors(FileInterceptor('gallery_image'))
    async uploadWorkImage(@Req() req: Request, @Body() uploadImageDto: UploadGalleryImageDto, @UploadedFile() file: Express.Multer.File) {
        const user = this._getUser(req);
        return await this._providerServices.uploadWorkImage(user.sub, user.type, uploadImageDto.type, file);
    }

    @Patch('update_password')
    async updatePassword(@Req() req: Request, @Body() { currentPassword, newPassword }: UpdatePasswordDto): Promise<IResponse> {
        const user = this._getUser(req);
        return await this._providerServices.updatePassword(user.sub, currentPassword, newPassword);
    }

}
