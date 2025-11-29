import { CompleteSignupDto, InitiateSignupDto } from '../../dtos/signup.dto';

export interface ISignupService {
  initiateSignup(initiateSignupDto: InitiateSignupDto): Promise<void>;
  verifyOtpAndCreateUser(completeSignupDto: CompleteSignupDto): Promise<void>;
}
