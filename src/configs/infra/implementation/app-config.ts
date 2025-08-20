import { IAppConfig } from "@configs/infra/interfaces/app-config.interface";

export const AppConfig: IAppConfig = {
    taxRate: Number(process.env.TAX_RATE ?? 0.18),
    timeZone: process.env.APP_TZ ?? 'UTC',
}