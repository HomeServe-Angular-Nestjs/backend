import { IUser } from "src/auth/common/entities/interfaces/user.entity";
import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, VerifyTokenDto } from "src/auth/dtos/login.dto";
import { IPayload } from "src/auth/dtos/payload.dto";

export interface ILoginService {
    validateUserCredentials(dto: AuthLoginDto): Promise<IUser>;
    forgotPassword(dto: ForgotPasswordDto): Promise<void>;
    verifyToken(dto: VerifyTokenDto): Promise<IPayload>;
    changePassword(dto: ChangePasswordDto): Promise<void>;
    generateTokens(user: IUser): Promise<string>;
    findOrCreateUser(user: GoogleLoginDto): Promise<IUser>
}