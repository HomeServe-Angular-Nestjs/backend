import { UserType } from '../dtos/login.dto';
import { JwtPayload } from 'jsonwebtoken';

export interface IPayload extends JwtPayload {
  sub: string;
  email: string;
  type?: UserType;
}
