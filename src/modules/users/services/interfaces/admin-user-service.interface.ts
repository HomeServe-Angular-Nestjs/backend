import { IUserData } from "src/core/entities/interfaces/admin.entity.interface";
import { GetUsersWithFilterDto, StatusUpdateDto } from "../../dtos/admin-user.dto";

export interface IAdminUserManagementService {
    getusers(dto: GetUsersWithFilterDto): Promise<IUserData[]>;
    updateUserStatus(dto: StatusUpdateDto): Promise<boolean>;
}