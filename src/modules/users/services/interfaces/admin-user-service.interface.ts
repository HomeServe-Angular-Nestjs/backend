import { IUserDataWithPagination } from '@core/entities/interfaces/admin.entity.interface';
import { GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto, UserReportDownloadDto } from '@modules/users/dtos/admin-user.dto';

export interface IAdminUserManagementService {
    getUsers(page: number, getUserDto: Omit<GetUsersWithFilterDto, 'page'>): Promise<IUserDataWithPagination>;
    updateUserStatus(statusUpdateDto: StatusUpdateDto): Promise<boolean>;
    removeUser(removeUserDto: RemoveUserDto): Promise<boolean>;
    downloadUserReport(reportFilterData: UserReportDownloadDto): Promise<Buffer>;
}