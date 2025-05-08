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
} from '@nestjs/common';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { PROVIDER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IProviderServices } from '../services/interfaces/provider-service.interface';
import { Provider } from '../../../core/entities/implementation/provider.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { IPayload } from '../../../core/misc/payload.interface';
import { UpdateDefaultSlotsDto } from '../dtos/provider.dto';
import { IProvider } from '../../../core/entities/interfaces/user.entity.interface';

@Controller('provider')
@UseInterceptors(AuthInterceptor)
export class ProviderController {
    private readonly logger = new Logger(ProviderController.name);

    constructor(
        @Inject(PROVIDER_SERVICE_NAME)
        private providerServices: IProviderServices,
    ) { }

    /**
     * Fetches all providers.
     *
     * @returns {Promise<Provider[]>} A list of provider documents.
     * @throws {InternalServerErrorException} If any error occurs while fetching.
     */
    @Get('fetch_providers')
    async fetchProviders(): Promise<Provider[]> {
        try {
            return await this.providerServices.getProviders();
        } catch (err) {
            this.logger.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException(
                'Something happened while fetching providers',
            );
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
            return await this.providerServices.fetchOneProvider(arg);
        } catch (err) {
            this.logger.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException(
                'Something happened while fetching providers',
            );
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
            const updateData = JSON.parse(dto);

            return await this.providerServices.bulkUpdateProvider(user.sub, updateData, file);
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update provider');
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

            console.log(updateData, id);

            return this.providerServices.partialUpdate(id, updateData);
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to partially update the provider');
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
    async updateDefaultSlot(@Req() req: Request, @Body() dto: UpdateDefaultSlotsDto): Promise<IProvider> {
        try {
            const user = req.user as IPayload;
            return await this.providerServices.updateDefaultSlot(dto, user.sub)
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update provider');
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
            this.providerServices.deleteDefaultSlot(user.sub);
        } catch (err) {
            this.logger.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update provider');
        }
    }
}
