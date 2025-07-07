import { IResponse } from "src/core/misc/response.util";
import { ICustomer } from "../../../../core/entities/interfaces/user.entity.interface";
import { ChangePasswordDto, UpdateProfileDto, UpdateSavedProvidersDto } from "../../dtos/customer.dto";

export interface ICustomerService {
    fetchOneCustomer(id: string): Promise<ICustomer | null>;
    partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer>;
    updateSavedProviders(id: string, dto: UpdateSavedProvidersDto): Promise<ICustomer>;
    searchProviders(search: string): Promise<IResponse>;
    updateProfile(customerId: string, updateData: UpdateProfileDto): Promise<IResponse<ICustomer>>;
    changePassword(customerId: string, data: ChangePasswordDto): Promise<IResponse<ICustomer>>;
    changeAvatar(customerId: string, file: Express.Multer.File): Promise<IResponse<ICustomer>>;
}