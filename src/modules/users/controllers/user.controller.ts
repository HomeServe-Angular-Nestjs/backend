import { ADMIN_USER_MANAGEMENT_SERVICE_NAME } from '@core/constants/service.constant';
import { IUserDataWithPagination } from '@core/entities/interfaces/admin.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import {
    GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto
} from '@modules/users/dtos/admin-user.dto';
import {
    IAdminUserManagementService
} from '@modules/users/services/interfaces/admin-user-service.interface';
import {
    BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, Patch, Query
} from '@nestjs/common';

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
      throw new InternalServerErrorException('Failed fetching the customers');
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
      throw new InternalServerErrorException('Failed updating user status');
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
      throw new InternalServerErrorException('Failed removing user');
    }
  }
}
