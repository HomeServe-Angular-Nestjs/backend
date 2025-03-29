import { CompleteSignupDto, InitiateSignupDto } from "src/auth/dtos/signup.dto";

export interface ISignupService {
    initiateSignup(dto: InitiateSignupDto): Promise<void>;
    completeSignup(dto: CompleteSignupDto): Promise<void>
}