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
} from '@nestjs/common';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';
import { PROVIDER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IProviderServices } from '../services/interfaces/provider-service.interface';
import { Provider } from '../../../core/entities/implementation/provider.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { IPayload } from '../../../core/misc/payload.interface';
import { UpdateDefaultSlotsDto } from '../dtos/provider.dto';
import { UserType } from '../../auth/dtos/login.dto';

@Controller('provider')
@UseInterceptors(AuthInterceptor)
export class ProviderController {
    constructor(
        @Inject(PROVIDER_SERVICE_NAME)
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
    async fetchOneProvider(@Req() req: Request, @Query() query: { id: string | null }) {
        try {
            const user = req.user as IPayload;
            let arg = user.sub;
            if (query && query.id !== null && query.id !== 'null') {
                arg = query.id;
            }
            return await this.providerServices.fetchOneProvider(arg);
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

    @Patch('default_slots')
    async updateDefaultSlot(@Req() req: Request, @Body() dto: UpdateDefaultSlotsDto) {
        try {
            const user = req.user as IPayload;
            return await this.providerServices.updateDefaultSlot(dto, user.sub)
        } catch (err) {
            console.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update provider');
        }
    }

    @Delete('default_slots')
    async deleteDefaultSlot(@Req() req: Request) {
        try {
            const user = req.user as IPayload;
            this.providerServices.deleteDefaultSlot(user.sub);
        } catch (err) {
            console.error(`Error updating provider: ${err.message}`, err.stack);
            throw new InternalServerErrorException('Failed to update provider');
        }
    }
}
