import {
    Controller,
    Get,
    Patch,
    Inject,
    InternalServerErrorException,
    UseInterceptors,
    Req,
    UploadedFile,
    Query,
    Body,
    Delete,
    Logger,
    BadRequestException,
    UnauthorizedException,
    Put,
} from '@nestjs/common';

import { PROVIDER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IProviderServices } from '../services/interfaces/provider-service.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { IPayload } from '../../../core/misc/payload.interface';
import { FilterDto, RemoveCertificateDto, SlotDto, UpdateBioDto, UploadCertificateDto } from '../dtos/provider.dto';
import { IProvider } from '../../../core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from 'src/core/enum/error.enum';

@Controller('provider')
export class ProviderController {
    private readonly logger = new Logger(ProviderController.name);

    constructor(
        @Inject(PROVIDER_SERVICE_NAME)
        private readonly _providerServices: IProviderServices,
    ) { }

    /**
 * Fetches all providers.
 *
 * @returns {Promise<Provider[]>} A list of provider documents.
 * @throws {InternalServerErrorException} If any error occurs while fetching.
 */
    @Get('fetch_providers')
    async fetchProviders(@Query() filter: FilterDto): Promise<IProvider[]> {
        try {
            return await this._providerServices.getProviders(filter);
        } catch (err) {
            this.logger.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Fetches a single provider by ID (either from query or from authenticated user).
     *
     * @param {Request} req - The request object containing user details.
     * @param {{ id: string | null }} query - Optional query parameter for provider ID.
     * @returns {Promise<Provider>} The requested provider document.
     * @throws {InternalServerErrorException} If any error occurs while fetching.
     */
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

    /**
     * Performs a bulk update of provider data, including optional avatar upload.
     *
     * @param {Request} req - Request containing authenticated user.
     * @param {string} dto - JSON stringified provider data in the body.
     * @param {Express.Multer.File} file - Optional uploaded avatar file.
     * @returns {Promise<Provider>} The updated provider document.
     * @throws {InternalServerErrorException} If update fails.
     */
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

    /**
     * Partially updates a provider by ID.
     *
     * @param {Partial<IProvider>} dto - The request body containing the provider's `id` and fields to update.
     * @returns {Promise<IProvider>} The updated provider document.
     * @throws {BadRequestException} If the `id` is missing from the request.
     * @throws {InternalServerErrorException} If the update operation fails.
     */
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

    /**
     * Updates the default slots configuration for the authenticated provider.
     *
     * @param {Request} req - Request object containing user payload.
     * @param {UpdateDefaultSlotsDto} dto - DTO with updated default slot values.
     * @returns {Promise<IProvider>} Result of the update operation.
     * @throws {InternalServerErrorException} If update fails.
     */
    @Patch('default_slots')
    async updateDefaultSlot(@Req() req: Request, @Body() dto: SlotDto): Promise<IProvider> {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new BadRequestException('Provider id missing');
            }

            this.logger.debug(dto);

            return await this._providerServices.updateDefaultSlot(dto, user.sub)
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    /**
    * Deletes the default slot settings for the authenticated provider.
    *
    * @param {Request} req - Request object containing user payload.
    * @returns {Promise<void>} Resolves on success.
    * @throws {InternalServerErrorException} If deletion fails.
    */
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

    @Put('bio')
    async updateBio(@Req() req: Request, @Body() dto: UpdateBioDto) {
        try {
            const user = req.user as IPayload;
            if (!user.sub) {
                throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED_ACCESS);

            }

            this.logger.debug('dto', dto);
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
}
