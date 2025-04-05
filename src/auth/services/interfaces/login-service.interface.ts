import { IUser } from "../../common/entities/interfaces/user.entity";
import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, VerifyTokenDto } from "../../dtos/login.dto";
import { IPayload } from "../../dtos/payload.dto";

export interface ILoginService {
    validateUserCredentials(dto: AuthLoginDto): Promise<IUser>;
    forgotPassword(dto: ForgotPasswordDto): Promise<void>;
    verifyToken(dto: VerifyTokenDto): Promise<IPayload>;
    changePassword(dto: ChangePasswordDto): Promise<void>;
    generateTokens(user: IUser): Promise<string>;
    findOrCreateUser(user: GoogleLoginDto): Promise<IUser>
}