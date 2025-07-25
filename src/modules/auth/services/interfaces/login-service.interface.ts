import { IUser } from '../../../../core/entities/interfaces/user.entity.interface';
import { IPayload } from '../../../../core/misc/payload.interface';
import {
    AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, VerifyTokenDto
} from '../../dtos/login.dto';

export interface ILoginService {
  validateUserCredentials(dto: AuthLoginDto): Promise<IUser>;
  forgotPassword(dto: ForgotPasswordDto): Promise<void>;
  verifyToken(dto: VerifyTokenDto): Promise<IPayload>;
  changePassword(dto: ChangePasswordDto): Promise<void>;
  generateAccessToken(user: IUser): string;
  generateRefreshToken(user: IUser): Promise<string>;
  findOrCreateUser(user: GoogleLoginDto): Promise<IUser>;
  invalidateRefreshToken(id: string): Promise<void>;
}
