import { Controller, Get, Inject, InternalServerErrorException, Logger, Req } from "@nestjs/common";
import { Request } from "express";
import { ADMIN_APPROVAL_SERVICE_NAME } from "src/core/constants/service.constant";
import { IAdminApprovalService } from "../services/interfaces/admin-approval-service.interface";
import { IApprovalOverviewData, IApprovalTableDetails } from "src/core/entities/interfaces/user.entity.interface";
import { IResponse } from "src/core/misc/response.util";
import { ErrorMessage } from "src/core/enum/error.enum";

@Controller('admin/approvals')
export class AdminApprovalsController {
    private readonly logger = new Logger(AdminApprovalsController.name);

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