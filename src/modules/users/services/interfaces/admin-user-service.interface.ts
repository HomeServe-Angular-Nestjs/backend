import { IUserDataWithPagination } from '@core/entities/interfaces/admin.entity.interface';
import {
    GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto,
    UserReportDownloadDto
} from '@modules/users/dtos/admin-user.dto';

export interface IAdminUserManagementService {
    getUsers(page: number, dto: Omit<GetUsersWithFilterDto, 'page'>): Promise<IUserDataWithPagination>;
    updateUserStatus(dto: StatusUpdateDto): Promise<boolean>;
    removeUser(dto: RemoveUserDto): Promise<boolean>;
    downloadUserReport(reportFilterData: UserReportDownloadDto): Promise<Buffer>;
}