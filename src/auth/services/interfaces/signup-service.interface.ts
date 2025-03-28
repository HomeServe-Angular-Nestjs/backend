import { CompleteSignupDto } from "src/auth/dtos/signup/complete-signup.dto";
import { InitiateSignupDto } from "src/auth/dtos/signup/initiate-signup.dto";

export interface ISignupService{
    initiateSignup(dto: InitiateSignupDto): Promise<void>;
    completeSignup(dto: CompleteSignupDto): Promise<void>
}