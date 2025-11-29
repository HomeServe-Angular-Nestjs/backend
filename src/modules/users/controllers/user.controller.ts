import { ADMIN_USER_MANAGEMENT_SERVICE_NAME } from '@core/constants/service.constant';
import { IUserDataWithPagination } from '@core/entities/interfaces/admin.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto, UserReportDownloadDto } from '@modules/users/dtos/admin-user.dto';
import { IAdminUserManagementService } from '@modules/users/services/interfaces/admin-user-service.interface';
import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('admin/users')
export class AdminUserController {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(ADMIN_USER_MANAGEMENT_SERVICE_NAME)
    private readonly _adminUserManagementService: IAdminUserManagementService
  ) {
    this.logger = this.loggerFactory.createLogger(AdminUserController.name)
  }

  @Get('')
  async getUsers(@Query() getUsersWithFilterDto: GetUsersWithFilterDto): Promise<IUserDataWithPagination> {
    const { page, ...filter } = getUsersWithFilterDto;
    return await this._adminUserManagementService.getUsers(page, filter);
  }

  @Patch('status')
  async updateUserStatus(@Body() statusUpdateDto: StatusUpdateDto) {
    return await this._adminUserManagementService.updateUserStatus(statusUpdateDto)
  }

  @Patch('remove')
  async removeUser(@Body() removeUserDto: RemoveUserDto) {
    return await this._adminUserManagementService.removeUser(removeUserDto)
  }

  @Post('download_report')
  async downloadUserReport(@Res() res: Response, @Body() userReportDownloadDto: UserReportDownloadDto): Promise<void> {
    try {
      const start = Date.now();
      const pdfBuffer = await this._adminUserManagementService.downloadUserReport(userReportDownloadDto)
      this.logger.debug(`[Admin] - PDF Generation Time: ${Date.now() - start}ms`);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="booking-report.pdf"',
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (err) {
      this.logger.error(`Error downloading user report: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }


}
