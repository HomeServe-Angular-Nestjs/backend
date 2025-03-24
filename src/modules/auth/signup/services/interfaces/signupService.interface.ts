import { InitialSignupDto } from "../../dtos/signup.dto";

export interface ISignupService {
    sendOtp(dto: InitialSignupDto): Promise<void>;
}