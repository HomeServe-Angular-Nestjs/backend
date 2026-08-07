import { Controller, Get, Inject, Query } from '@nestjs/common';
import { LANDING_SERVICE_NAME } from '@core/constants/service.constant';
import { IResponse } from '@core/misc/response.util';
import { ILandingData, ILandingSearchCategory } from '@core/entities/interfaces/landing.entity.interface';
import { ILandingService } from '@modules/landing/services/interfaces/landing-service.interface';

@Controller('landing')
export class LandingController {
    constructor(
        @Inject(LANDING_SERVICE_NAME)
        private readonly _landingService: ILandingService,
    ) { }

    @Get('home')
    async getLandingData(): Promise<IResponse<ILandingData>> {
        return await this._landingService.getLandingData();
    }

    @Get('search-categories')
    async searchCategories(@Query() { search }: { search: string }): Promise<IResponse<ILandingSearchCategory[]>> {
        return await this._landingService.searchCategories(search);
    }
}