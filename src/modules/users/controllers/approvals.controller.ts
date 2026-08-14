import { ADMIN_APPROVAL_SERVICE_NAME } from '@core/constants/service.constant';
import { IApprovalOverviewData, IApprovalTableDetails } from '@core/entities/interfaces/user.entity.interface';
import { AdminRoleGuard } from '@core/guards/admin-role.guard';
import { IResponse } from '@core/misc/response.util';
import { IAdminApprovalService } from '@modules/users/services/interfaces/admin-approval-service.interface';
import { UpdateProviderVerificationDto } from '@modules/users/dtos/admin-user.dto';
import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common';

@UseGuards(AdminRoleGuard)
@Controller('admin/approvals')
export class AdminApprovalsController {
  constructor(
    @Inject(ADMIN_APPROVAL_SERVICE_NAME)
    private readonly _adminApprovalService: IAdminApprovalService,
  ) {}

  @Get('overview')
  async fetchApprovalOverviewDetails(): Promise<IResponse<IApprovalOverviewData>> {
    return await this._adminApprovalService.fetchApprovalOverviewDetails();
  }

  @Get('data')
  async fetchApprovalTableData(): Promise<IResponse<IApprovalTableDetails[]>> {
    return await this._adminApprovalService.fetchApprovalTableData();
  }

  @Patch('verify')
  async updateProviderVerification(@Body() updateProviderVerificationDto: UpdateProviderVerificationDto): Promise<IResponse<boolean>> {
    return await this._adminApprovalService.updateProviderVerification(
      updateProviderVerificationDto.providerId,
      updateProviderVerificationDto.status,
    );
  }
}
