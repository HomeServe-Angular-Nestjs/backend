import { AuthLoginDto } from "src/auth/dtos/login/login.dto";

export interface ILoginService {
    authenticateCredentials(dto: AuthLoginDto): Promise<boolean>
}