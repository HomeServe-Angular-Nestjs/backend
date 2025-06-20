import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  Patch,
  Query,
} from '@nestjs/common';
import { ADMIN_USERMANAGEMENT_SERVICE_NAME } from '../../../core/constants/service.constant';

import { IAdminUserManagementService } from '../services/interfaces/admin-user-service.interface';
import { GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto } from '../dtos/admin-user.dto';
import { IUserData, IUserDataWithPagination } from 'src/core/entities/interfaces/admin.entity.interface';

@Controller('admin/users')
export class AdminUserController {
  private readonly logger = new Logger(AdminUserController.name);

  constructor(
    @Inject(ADMIN_USERMANAGEMENT_SERVICE_NAME)
    private readonly _adminuserManagementService: IAdminUserManagementService

  ) { }

  @Get('')
  async getUsers(@Query() dto: GetUsersWithFilterDto): Promise<IUserDataWithPagination> {
    try {
      if (!dto.role) {
        throw new BadRequestException('Required role is missing.');
      }
      const { page, ...filter } = dto;

      return await this._adminuserManagementService.getusers(page, filter);
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

      return await this._adminuserManagementService.updateUserStatus(dto)
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

      return await this._adminuserManagementService.removeUser(dto)
    } catch (err) {
      this.logger.error(`Error removing user: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed removing user');
    }
  }
}
