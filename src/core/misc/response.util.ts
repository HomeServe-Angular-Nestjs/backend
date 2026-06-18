
export interface IResponse<T = any> {
    code?: string | null,
    success: boolean,
    message: string,
    data?: T
}

export const prepareResponse = (success: boolean, message: string, data: any = null, code: string | null = null): IResponse => {
    return {
        code,
        message,
        success,
        data
    }
}