import { IPayload } from "../../dtos/payload.dto"

export interface ITokenService {
    generateToken(userId: string, email: string): Promise<string>,
    validateAccessToken(token: string): Promise<IPayload>,
    validateRefreshToken(userId: string, token: string)
    invalidateTokens(userId: string)
}