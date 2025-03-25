import { CompleteSignupDto } from "src/auth/dtos/complete-signup.dto";

export interface ISignupService {
    initiateSignup(email: string): Promise<void>;
    completeSignup(dto: CompleteSignupDto): Promise<void>
}