import { ErrorCodes } from "@core/enum/error.enum"

export interface IResponse<T = any> {
    code?: ErrorCodes | null,
    success: boolean,
    message: string,
    data?: T
}

export const prepareResponse = (success: boolean, message: string, data: any = null, code: ErrorCodes | null = null): IResponse => {
    return {
        code,
        message,
        success,
        data
    }
}