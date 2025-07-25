import { Request } from 'express';

import { PROVIDER_SERVICE_NAME } from '@core/constants/service.constant';
import { IProvider } from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IPayload } from '@core/misc/payload.interface';
import {
    BadRequestException, Body, Controller, Delete, Get, Inject, InternalServerErrorException, Patch,
    Put, Query, Req, UnauthorizedException, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
    FilterDto, GetProvidersFromLocationSearch, RemoveCertificateDto, SlotDto, UpdateBioDto,
    UploadCertificateDto, UploadGalleryImageDto
} from '../dtos/provider.dto';
import { IProviderServices } from '../services/interfaces/provider-service.interface';

@Controller('provider')
export class ProviderController {
    private readonly logger = new CustomLogger(ProviderController.name);

    constructor(
        @Inject(PROVIDER_SERVICE_NAME)
        private readonly _providerServices: IProviderServices,
    ) { }

    @Get('fetch_providers')
    async fetchProviders(@Query() dto: FilterDto & GetProvidersFromLocationSearch) {
        try {
            const { lat, lng, title, ...filter } = dto;

            if (lat && lng && title) {
                const locationSearch = { lat, lng, title };
                return await this._providerServices.getProvidersLocationBasedSearch(locationSearch);
            } else {
                return await this._providerServices.getProviders(filter);
            }
        } catch (err) {
            this.logger.error(`Error fetching providers: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('fetch_one_provider')
    async fetchOneProvider(@Req() req: Request, @Query() query: { id: string | null }): Promise<IProvider> {
        try {
            const user = req.user as IPayload;
            let arg = user.sub;
            if (query && query.id !== null && query.id !== 'null') {
                arg = query.id;
            }
            return await this._providerServices.fetchOneProvider(arg);
        } catch (err) {
            this.logger.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('reviews')
    async getReviews(@Query() { providerId }: { providerId: string }) {
        try {
            return await this._providerServices.getReviews(providerId);
        } catch (err) {
            this.logger.error(`Error fetching provider reviews: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('bio')
    async updateBio(@Req() req: Request, @Body() dto: UpdateBioDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

            }

            return await this._providerServices.updateBio(user.sub, dto);

        } catch (err) {
            this.logger.error(`Error updating provider bio: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('cert_upload')
    @UseInterceptors(FileInterceptor('doc'))
    async uploadCertificate(@Req() req: Request, @Body() { label }: UploadCertificateDto, @UploadedFile() file: Express.Multer.File) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            if (!label || !file) {
                throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
            }

            return await this._providerServices.uploadCertificate(user.sub, label, file);
        } catch (err) {
            this.logger.error(`Error uploading provider certificate: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    // Performs a bulk update of provider data, including optional avatar upload.
    @Patch('update_provider')
    @UseInterceptors(FileInterceptor('providerAvatar'))
    async bulkUpdateProvider(
        @Req() req: Request,
        @Body('providerData') dto: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<IProvider> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

            }
            const updateData = JSON.parse(dto);

            return await this._providerServices.bulkUpdateProvider(user.sub, updateData, file);
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('partial_update')
    async partialUpdate(@Body() dto: Partial<IProvider>): Promise<IProvider> {
        try {
            const { id, ...updateData } = dto;
            if (!id) {
                throw new BadRequestException('Id is is not found in the request');
            }

            return this._providerServices.partialUpdate(id, updateData);
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('default_slots')
    async updateDefaultSlot(@Req() req: Request, @Body() dto: SlotDto): Promise<IProvider> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id missing');
            }

            return await this._providerServices.updateDefaultSlot(dto, user.sub)
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('default_slots')
    async deleteDefaultSlot(@Req() req: Request): Promise<void> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

            }
            this._providerServices.deleteDefaultSlot(user.sub);
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('cert_remove')
    @UseInterceptors(FileInterceptor('doc'))
    async removeCertificate(@Req() req: Request, @Body() { docId }: RemoveCertificateDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            if (!docId) {
                throw new BadRequestException(ErrorMessage.MISSING_FIELDS);
            }

            // return await this._providerServices.uploadCertificate(user.sub, label, file);
        } catch (err) {
            this.logger.error(`Error uploading provider certificate: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('work_images')
    async getWorkImage(@Req() req: Request) {
        try {
            const user = req.user as IPayload;
            if (!user.sub || !user.type) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._providerServices.getWorkImages(user.sub);
        } catch (err) {
            this.logger.error(`Error uploading provider gallery image: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('gallery_upload')
    @UseInterceptors(FileInterceptor('gallery_image'))
    async uploadWorkImage(@Req() req: Request, @Body() dto: UploadGalleryImageDto, @UploadedFile() file: Express.Multer.File) {
        try {
            const user = req.user as IPayload;
            if (!user.sub || !user.type) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);
            }

            return await this._providerServices.uploadWorkImage(user.sub, user.type, dto.type, file);
        } catch (err) {
            this.logger.error(`Error uploading provider gallery image: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
