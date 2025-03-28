import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { ISignupService } from "../interfaces/signup-service.interface";
import { IOtpService } from "../interfaces/otp-service.interface";

import { OTP_SERVICE_INTERFACE_NAME } from "src/auth/constants/service.constant";

import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";
import { ICustomerRepository } from "src/auth/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "src/auth/repositories/interfaces/provider-repo.interface";

import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, } from "src/auth/constants/repository.constant";

import { IArgonUtility } from "src/auth/common/utilities/interface/argon.utility.interface";

import { ARGON_UTILITY_NAME } from "src/auth/constants/utility.constant";

import { Customer } from "src/auth/common/entities/customer.entity";
import { Provider } from "src/auth/common/entities/provider.entity";

import { ICustomer } from "src/auth/common/interfaces/customer.entity.interface";
import { IProvider } from "src/auth/common/interfaces/provider.entity.interface";

import { CompleteSignupDto } from "../../dtos/signup/complete-signup.dto";
import { InitiateSignupDto } from "../../dtos/signup/initiate-signup.dto";


@Injectable()
export class SignupService implements ISignupService {

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly providerRepository: IProviderRepository,
        @Inject(OTP_SERVICE_INTERFACE_NAME)
        private readonly otpService: IOtpService,
        @Inject(ARGON_UTILITY_NAME)
        private readonly argon: IArgonUtility
    ) { }

    // Initiates signup
    async initiateSignup(dto: InitiateSignupDto): Promise<void> {

        // Checking if already exists.
        if (await this.checkEmailExistence(dto)) {
            throw new ConflictException('Email already exists');
        }

        // Generate and sends otp.
        await this.otpService.generateAndSendOtp(dto.email);
    }

    async completeSignup(dto: CompleteSignupDto): Promise<void> {
        const hashedPassword = await this.argon.hash(dto.password);

        const repository: IBaseRepository<ICustomer | IProvider> = dto.type === 'customer'
            ? this.customerRepository
            : this.providerRepository;

        const entity = dto.type === 'customer'
            ? new Customer({
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
                isActive: true,
            })
            : new Provider({
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
                isActive: true,
            });

        await repository.create(entity);
    }

    private async checkEmailExistence(dto: InitiateSignupDto): Promise<boolean> {
        const repository = dto.type === 'customer' ? this.customerRepository : this.providerRepository;
        const existingEntry = await repository.findByEmail(dto.email);
        return existingEntry ? true : false;
    }
}