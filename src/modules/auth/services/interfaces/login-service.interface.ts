import { IUser } from '../../../../core/entities/interfaces/user.entity.interface';
import { IPayload } from '../../../../core/misc/payload.interface';
import {
  AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, VerifyTokenDto
} from '../../dtos/login.dto';

export interface ILoginService {
  validateUserCredentials(dto: AuthLoginDto): Promise<IUser>;
  forgotPassword(dto: ForgotPasswordDto): Promise<void>;
  changePassword(dto: ChangePasswordDto): Promise<void>;
  findOrCreateUser(user: GoogleLoginDto): Promise<IUser>;
}
