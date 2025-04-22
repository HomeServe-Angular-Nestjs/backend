import {
    Controller,
    Get,
    Patch,
    Inject,
    InternalServerErrorException,
    UseInterceptors,
    Req,
    UploadedFile,
} from '@nestjs/common';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { PROVIDER_SERVICES_NAME } from '../../../core/constants/service.constant';
import { IProviderServices } from '../services/interfaces/provider-service.interface';
import { Provider } from '../../../core/entities/implementation/provider.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { IPayload } from '../../auth/misc/payload.interface';

@Controller('provider')
@UseInterceptors(AuthInterceptor)
export class ProviderController {
    constructor(
        @Inject(PROVIDER_SERVICES_NAME)
        private providerServices: IProviderServices,
    ) { }

    @Get('fetch_providers')
    async fetchProviders(): Promise<Provider[]> {
        try {
            return await this.providerServices.getProviders();
        } catch (err) {
            console.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException(
                'Something happened while fetching providers',
            );
        }
    }

    @Get('fetch_one_provider')
    async fetchOneProvider(@Req() req: Request) {
        try {
            const user = req.user as IPayload;
            return await this.providerServices.fetchOneProvider(user);
        } catch (err) {
            console.error(`Error fetching provider: ${err}`);
            throw new InternalServerErrorException(
                'Something happened while fetching providers',
            );
        }
    }

    @Patch('update_providers')
    @UseInterceptors(FileInterceptor('providerAvatar'))
    async updateProvider(
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File,
    ) {
        try {
            const user = req.user as IPayload;
            const updateData = JSON.parse(req.body.providerData);

            return await this.providerServices.updateProvider(user, updateData, file);
        } catch (err) {
            console.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update provider');
        }
    }
}
