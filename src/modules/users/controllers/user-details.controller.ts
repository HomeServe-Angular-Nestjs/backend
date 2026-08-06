import { ADMIN_USER_DETAILS_SERVICE_NAME } from '@core/constants/service.constant';
import { ICustomerDetailsBundle, IProviderDetailsBundle } from '@core/entities/interfaces/admin-user-details.entity.interface';
import { AdminRoleGuard } from '@core/guards/admin-role.guard';
import { IResponse } from '@core/misc/response.util';
import { isValidIdPipe } from '@core/pipes/is-valid-id.pipe';
import { IAdminUserDetailsService } from '@modules/users/services/interfaces/admin-user-details-service.interface';
import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';

@UseGuards(AdminRoleGuard)
@Controller('admin')
export class AdminUserDetailsController {
    constructor(
        @Inject(ADMIN_USER_DETAILS_SERVICE_NAME)
        private readonly _adminUserDetailsService: IAdminUserDetailsService,
    ) { }

    @Get('customers/:id')
    async getCustomerDetails(@Param('id', new isValidIdPipe()) customerId: string): Promise<IResponse<ICustomerDetailsBundle>> {
        return await this._adminUserDetailsService.getCustomerDetails(customerId);
    }

    @Get('providers/:id')
    async getProviderDetails(@Param('id', new isValidIdPipe()) providerId: string): Promise<IResponse<IProviderDetailsBundle>> {
        return await this._adminUserDetailsService.getProviderDetails(providerId);
    }
}