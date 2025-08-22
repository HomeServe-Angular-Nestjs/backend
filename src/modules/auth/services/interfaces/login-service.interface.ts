import { IResponse } from '@core/misc/response.util';
import { IUser } from '../../../../core/entities/interfaces/user.entity.interface';
import { AuthLoginDto, ChangePasswordDto, EmailAndTypeDto, GoogleLoginDto } from '../../dtos/login.dto';

export interface ILoginService {
  validateUserCredentials(dto: AuthLoginDto): Promise<IUser>;
  requestOtpForForgotPassword(dto: EmailAndTypeDto): Promise<IResponse>;
  verifyOtpFromForgotPassword(email: string, code: string): Promise<IResponse>;
  changePassword(dto: ChangePasswordDto): Promise<IResponse>;
  findOrCreateUser(user: GoogleLoginDto): Promise<IUser>;
}
