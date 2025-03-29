import { IPayload } from "../../entities/interfaces/payload.entity.interface";

export interface ITokenUtility {
    generateAccessToken(payload: IPayload): string;
    generateRefreshToken(payload: IPayload): string;
    verifyToken(token: string): Promise<IPayload>;
}