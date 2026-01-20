import { Body, Controller, Delete, FileTypeValidator, Get, Inject, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Put, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { PROVIDER_OFFER_SERVICE_NAME } from "@core/constants/service.constant";
import { IProviderServiceService } from "../services/interfaces/provider-service.interface";
import { CreateProviderServiceDto, UpdateProviderServiceDto } from "../dto/provider-service.dto";
import { IResponse } from "@core/misc/response.util";
import { IProviderService, IProviderServiceUI } from "@core/entities/interfaces/provider-service.entity.interface";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { IPayload } from "@core/misc/payload.interface";
import { User } from "@core/decorators/extract-user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('provider-service')
export class ProviderServiceController {
    constructor(
        @Inject(PROVIDER_OFFER_SERVICE_NAME)
        private readonly _service: IProviderServiceService
    ) { }

    @Post('')
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @User() user: IPayload,
        @Body() createServiceDto: CreateProviderServiceDto,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
                new FileTypeValidator({ fileType: 'jpg|jpeg|png' }),
            ]
        })) file: Express.Multer.File): Promise<IResponse<IProviderServiceUI>> {
        return await this._service.createService(user.sub, user.type, createServiceDto, file);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @User() user: IPayload,
        @Param('id', new isValidIdPipe()) serviceId: string,
        @Body() updateServiceDto: UpdateProviderServiceDto,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
                new FileTypeValidator({ fileType: 'jpg|jpeg|png' }),
            ]
        })) file: Express.Multer.File)
        : Promise<IResponse<IProviderServiceUI>> {
        return await this._service.updateService(user.sub, user.type, serviceId, updateServiceDto, file);
    }

    @Get('my-services')
    async getMyServices(@User() user: IPayload): Promise<IResponse<IProviderServiceUI[]>> {
        return await this._service.findAllByProviderId(user.sub);
    }

    @Get('/:providerId')
    async getProviderServices(@Param('providerId', new isValidIdPipe()) providerId: string): Promise<IResponse<IProviderServiceUI[]>> {
        return await this._service.findAllByProviderId(providerId);
    }

    @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', new isValidIdPipe()) serviceId: string): Promise<IResponse> {
        return await this._service.toggleStatus(serviceId);
    }

    @Delete(':id')
    async delete(@Param('id', new isValidIdPipe()) serviceId: string): Promise<IResponse> {
        return await this._service.deleteService(serviceId);
    }

    @Post('can-create-service')
    async canCreateService(@User() user: IPayload): Promise<IResponse<boolean>> {
        return await this._service.canProviderCreateService(user.sub, user.type);
    }
}
