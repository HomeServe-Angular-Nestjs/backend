import { IPayload } from "../../misc/payload.interface"

export interface ITokenService {
    generateToken(userId: string, email: string): Promise<string>,
    validateAccessToken(token: string): Promise<IPayload>,
    validateRefreshToken(userId: string, token: string)
    invalidateTokens(userId: string)
}