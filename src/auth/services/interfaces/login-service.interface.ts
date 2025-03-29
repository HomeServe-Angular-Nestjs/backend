import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, VerifyTokenDto } from "src/auth/dtos/login.dto";
import { IPayload } from "src/auth/dtos/payload.dto";

export interface ILoginService {
    authenticateCredentials(dto: AuthLoginDto): Promise<boolean>;
    forgotPassword(dto: ForgotPasswordDto): Promise<void>;
    verifyToken(dto: VerifyTokenDto): Promise<IPayload>;
    changePassword(dto: ChangePasswordDto): Promise<void>;
}