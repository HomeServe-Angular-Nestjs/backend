import { IUser } from '../../../../core/entities/interfaces/user.entity.interface';
import {
  AuthLoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  GoogleLoginDto,
  VerifyTokenDto,
} from '../../dtos/login.dto';
import { IPayload } from '../../../../core/misc/payload.interface';

export interface ILoginService {
  validateUserCredentials(dto: AuthLoginDto): Promise<IUser>;
  forgotPassword(dto: ForgotPasswordDto): Promise<void>;
  verifyToken(dto: VerifyTokenDto): Promise<IPayload>;
  changePassword(dto: ChangePasswordDto): Promise<void>;
  generateTokens(user: IUser): Promise<string>;
  generateAccessToken(user: IUser): string;
  generateRefreshToken(user: IUser): Promise<string>;
  findOrCreateUser(user: GoogleLoginDto): Promise<IUser>;
}
