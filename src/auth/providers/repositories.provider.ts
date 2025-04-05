import { Provider } from "@nestjs/common";
import { ADMIN_REPOSITORY_INTERFACE_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, OTP_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "../constants/repository.constant";
import { CustomerRepository } from "../repositories/implementations/customer.repository";
import { getModelToken } from "@nestjs/mongoose";
import { ADMIN_MODEL_NAME, CUSTOMER_MODEL_NAME, OTP_MODEL_NAME, PROVIDER_MODEL_NAME } from "../constants/model.constant";
import { OtpRepository } from "../repositories/implementations/otp.repository";
import { ProviderRepository } from "../repositories/implementations/provider.repository";
import { AdminRepository } from "../repositories/implementations/admin.repository";

export const repositoryProvider: Provider[] = [
    {
        provide: CUSTOMER_REPOSITORY_INTERFACE_NAME,
        useFactory: (customerModel) => new CustomerRepository(customerModel),
        inject: [getModelToken(CUSTOMER_MODEL_NAME)],
    },
    {
        provide: OTP_REPOSITORY_INTERFACE_NAME,
        useFactory: (otpModel) => new OtpRepository(otpModel),
        inject: [getModelToken(OTP_MODEL_NAME)]
    },
    {
        provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
        useFactory: (providerModel) => new ProviderRepository(providerModel),
        inject: [getModelToken(PROVIDER_MODEL_NAME)],
    },
    // {
    //     provide: ADMIN_REPOSITORY_INTERFACE_NAME,
    //     useFactory: (adminModel) => new AdminRepository(adminModel),
    //     inject: [getModelToken(ADMIN_MODEL_NAME)],
    // }
]