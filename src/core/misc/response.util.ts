export interface IResponse {
    success: boolean,
    message: string,
    data?: any
}

export const prepareResponse = (success: boolean, message: string, data: any = null): IResponse => {
    return {
        message,
        success,
        data
    }
}