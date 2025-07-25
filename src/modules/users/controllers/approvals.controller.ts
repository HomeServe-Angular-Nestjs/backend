import { ADMIN_APPROVAL_SERVICE_NAME } from '@core/constants/service.constant';
import {
    IApprovalOverviewData, IApprovalTableDetails
} from '@core/entities/interfaces/user.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { IResponse } from '@core/misc/response.util';
import {
    IAdminApprovalService
} from '@modules/users/services/interfaces/admin-approval-service.interface';
import { Controller, Get, Inject, InternalServerErrorException, Logger, Req } from '@nestjs/common';

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
}
