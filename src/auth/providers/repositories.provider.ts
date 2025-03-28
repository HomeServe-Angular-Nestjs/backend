import { Provider } from "@nestjs/common";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, OTP_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "../constants/repository.constant";
import { CustomerRepository } from "../repositories/implementations/customer.repository";
import { getModelToken } from "@nestjs/mongoose";
import { CUSTOMER_MODEL_NAME, OTP_MODEL_NAME, PROVIDER_MODEL_NAME } from "../constants/model.constant";
import { OtpRepository } from "../repositories/implementations/otp.repository";
import { ProviderRepository } from "../repositories/implementations/provider.repository";

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
    }
]