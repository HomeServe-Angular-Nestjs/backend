import { UserType } from "../../../modules/auth/dtos/login.dto";
import { IPayload } from "../interfaces/payload.entity.interface";

export class Payload implements IPayload {
    id?: string;
    email: string;
    username?: string;
    type: UserType;
}