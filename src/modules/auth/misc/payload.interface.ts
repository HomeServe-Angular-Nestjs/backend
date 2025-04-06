import { UserType } from "../dtos/login.dto";

export interface IPayload {
    id?: string;
    email: string;
    username?: string;
    type: UserType;
}