import { CompleteSignupDto } from "src/auth/dtos/complete-signup.dto";
import { InitiateSignupDto } from "src/auth/dtos/initiate-signup.dto";

export interface ISignupService {
    initiateSignup(dto: InitiateSignupDto): Promise<void>;
    completeSignup(dto: CompleteSignupDto): Promise<void>
}