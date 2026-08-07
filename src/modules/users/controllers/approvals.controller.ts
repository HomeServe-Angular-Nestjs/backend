import { ADMIN_APPROVAL_SERVICE_NAME } from '@core/constants/service.constant';
import {
    IApprovalOverviewData, IApprovalTableDetails
} from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { AdminRoleGuard } from '@core/guards/admin-role.guard';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import {
    IAdminApprovalService
} from '@modules/users/services/interfaces/admin-approval-service.interface';
import { UpdateProviderVerificationDto } from '@modules/users/dtos/admin-user.dto';
import { Body, Controller, Get, Inject, InternalServerErrorException, Logger, Patch, Req, UseGuards } from '@nestjs/common';

@UseGuards(AdminRoleGuard)
@Controller('admin/approvals')
export class AdminApprovalsController {
    private readonly logger = new CustomLogger(AdminApprovalsController.name);

    constructor(
        @Inject(ADMIN_APPROVAL_SERVICE_NAME)
        private readonly _adminApprovalService: IAdminApprovalService
    ) { }

    @Get('overview')
    async fetchApprovalOverviewDetails(): Promise<IResponse<IApprovalOverviewData>> {
        try {
            return await this._adminApprovalService.fetchApprovalOverviewDetails();
        } catch (err) {
            this.logger.error(`Error fetching approval overview details: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('data')
    async fetchApprovalTableData(): Promise<IResponse<IApprovalTableDetails[]>> {
        try {
            return await this._adminApprovalService.fetchApprovalTableData();
        } catch (err) {
            this.logger.error(`Error fetching approval table data: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch('verify')
    async updateProviderVerification(@Body() updateProviderVerificationDto: UpdateProviderVerificationDto): Promise<IResponse<boolean>> {
        try {
            return await this._adminApprovalService.updateProviderVerification(
                updateProviderVerificationDto.providerId,
                updateProviderVerificationDto.status,
            );
        } catch (err) {
            this.logger.error(`Error updating provider verification: ${err.message}`, err.stack);
            throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }
    }
}
