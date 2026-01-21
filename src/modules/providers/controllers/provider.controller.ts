import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Put, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilterDto, GetReviewsDto, RemoveCertificateDto, SlotDto, UpdateBioDto, UpdateBufferTimeDto, UpdatePasswordDto, UploadCertificateDto, UploadGalleryImageDto } from '@modules/providers/dtos/provider.dto';
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
import { User } from '@core/decorators/extract-user.decorator';
import { isValidIdPipe } from '@core/pipes/is-valid-id.pipe';
import { DateDto } from '@modules/availability/dto/availability.dto';

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
    async fetchProviders(@User() user: IPayload, @Query() filterDto: FilterDto) {
        const { page, limit, ...filter } = filterDto;
        return await this._providerServices.getProviders({ ...filter, page: Number(page), limit: Number(limit) });
    }

    @Get('fetch_one_provider')
    async fetchOneProvider(@User() user: IPayload, @Query() query: { providerId: string | null }): Promise<IProvider> {
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
    async updateBio(@User() user: IPayload, @Body() updateBioDto: UpdateBioDto) {
        return await this._providerServices.updateBio(user.sub, updateBioDto);
    }

    @Put('cert_upload')
    @UseInterceptors(FileInterceptor('doc'))
    async uploadCertificate(@User() user: IPayload, @Body() { label }: UploadCertificateDto, @UploadedFile() file: Express.Multer.File) {

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
    async bulkUpdateProvider(@User() user: IPayload, @Body('providerData') providerDetailsDto: string, @UploadedFile() file: Express.Multer.File,): Promise<IProvider> {
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
    async updateDefaultSlot(@User() user: IPayload, @Body() dto: SlotDto): Promise<IProvider> {
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
    async getWorkImage(@User() user: IPayload,) {
        return await this._providerServices.getWorkImages(user.sub);
    }

    @Patch('gallery_upload')
    @UseInterceptors(FileInterceptor('gallery_image'))
    async uploadWorkImage(@User() user: IPayload, @Body() uploadImageDto: UploadGalleryImageDto, @UploadedFile() file: Express.Multer.File) {
        return await this._providerServices.uploadWorkImage(user.sub, user.type, uploadImageDto.type, file);
    }

    @Patch('update_password')
    async updatePassword(@User() user: IPayload, @Body() { currentPassword, newPassword }: UpdatePasswordDto): Promise<IResponse> {
        return await this._providerServices.updatePassword(user.sub, currentPassword, newPassword);
    }

    @Get('available-slots/:id')
    async fetchAvailabilitySlots(@User() user: IPayload, @Param('id', new isValidIdPipe()) providerId: string, @Query() { date }: DateDto): Promise<IResponse> {
        return this._providerServices.fetchAvailableSlotsByProviderId(user.sub, providerId, new Date(date));
    }

    @Patch('buffer')
    async updateBufferTime(@User() user: IPayload, @Body() { bufferTime }: UpdateBufferTimeDto): Promise<IResponse<IProvider>> {
        return this._providerServices.updateBufferTime(user.sub, bufferTime);
    }
}
