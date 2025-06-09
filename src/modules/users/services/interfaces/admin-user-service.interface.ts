import { IUserData, IUserDataWithPagination } from "src/core/entities/interfaces/admin.entity.interface";
import { GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto } from "../../dtos/admin-user.dto";

export interface IAdminUserManagementService {
    getusers(page: number, dto: Omit<GetUsersWithFilterDto, 'page'>): Promise<IUserDataWithPagination>;
    updateUserStatus(dto: StatusUpdateDto): Promise<boolean>;
    removeUser(dto: RemoveUserDto): Promise<boolean>;
}