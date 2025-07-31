import { ADMIN_USER_MANAGEMENT_SERVICE_NAME } from '@core/constants/service.constant';
import { IUserDataWithPagination } from '@core/entities/interfaces/admin.entity.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import {
  GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto,
  UserReportDownloadDto
} from '@modules/users/dtos/admin-user.dto';
import {
  IAdminUserManagementService
} from '@modules/users/services/interfaces/admin-user-service.interface';
import {
  BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Post, Query,
  Res
} from '@nestjs/common';
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
  async getUsers(@Query() dto: GetUsersWithFilterDto): Promise<IUserDataWithPagination> {
    try {
      if (!dto.role) {
        throw new BadRequestException('Required role is missing.');
      }
      const { page, ...filter } = dto;

      return await this._adminUserManagementService.getUsers(page, filter);
    } catch (err) {
      this.logger.error(`Error fetching the customers: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('status')
  async updateUserStatus(@Body() dto: StatusUpdateDto) {
    try {
      for (const [key, value] of Object.entries(dto)) {
        if (value === undefined || value === null) {
          throw new BadRequestException(`Missing value for ${key}`);
        }
      }

      return await this._adminUserManagementService.updateUserStatus(dto)
    } catch (err) {
      this.logger.error(`Error updating user status: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('remove')
  async removeUser(@Body() dto: RemoveUserDto) {
    try {
      for (const [key, value] of Object.entries(dto)) {
        if (value === undefined || value === null) {
          throw new BadRequestException(`Missing value for ${key}`);
        }
      }

      return await this._adminUserManagementService.removeUser(dto)
    } catch (err) {
      this.logger.error(`Error removing user: ${err.message}`, err.stack);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('download_report')
  async downloadUserReport(@Res() res: Response, @Body() dto: UserReportDownloadDto): Promise<void> {
    try {
      const start = Date.now();
      this.logger.debug(dto)
      const pdfBuffer = await this._adminUserManagementService.downloadUserReport(dto)
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
