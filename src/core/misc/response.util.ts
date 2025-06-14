export interface IResponse<T = any> {
    success: boolean,
    message: string,
    data?: T
}

export const prepareResponse = (success: boolean, message: string, data: any = null): IResponse => {
    return {
        message,
        success,
        data
    }
}