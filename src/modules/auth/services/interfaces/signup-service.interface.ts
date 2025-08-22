import { CompleteSignupDto, InitiateSignupDto } from '../../dtos/signup.dto';

export interface ISignupService {
  initiateSignup(dto: InitiateSignupDto): Promise<void>;
  verifyOtpAndCreateUser(dto: CompleteSignupDto): Promise<void>;
}
