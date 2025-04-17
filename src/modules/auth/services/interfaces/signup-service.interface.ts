import { CompleteSignupDto, InitiateSignupDto } from '../../dtos/signup.dto';

export interface ISignupService {
  initiateSignup(dto: InitiateSignupDto): Promise<void>;
  completeSignup(dto: CompleteSignupDto): Promise<void>;
}
