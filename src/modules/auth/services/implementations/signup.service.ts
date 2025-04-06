import { ConflictException, Inject, Injectable } from "@nestjs/common";

import { ISignupService } from "../interfaces/signup-service.interface";
import { IOtpService } from "../interfaces/otp-service.interface";

import { OTP_SERVICE_INTERFACE_NAME } from "../../../../core/constants/service.constant";

import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";

import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";

import { IArgonUtility } from "../../../../core/utilities/interface/argon.utility.interface";

import { ARGON_UTILITY_NAME } from "../../../../core/constants/utility.constant";

import { Customer } from "../../../../core/entities/implementation/customer.entity";
import { Provider } from "../../../../core/entities/implementation/provider.entity";

import { CompleteSignupDto, InitiateSignupDto } from "../../dtos/signup.dto";


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

        if (await this.checkEmailExistence(dto)) {
            throw new ConflictException('Email already exists');
        }

        await this.otpService.generateAndSendOtp(dto.email);
    }

    async completeSignup(dto: CompleteSignupDto): Promise<void> {
        const hashedPassword = await this.argon.hash(dto.password);

        if (dto.type === 'customer') {
            await this.customerRepository.create(new Customer({
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
                isActive: true,
            }));
        } else if (dto.type === 'provider') {
            await this.providerRepository.create(new Provider({
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
                isActive: true,
            }));
        }
    }

    private async checkEmailExistence(dto: InitiateSignupDto): Promise<boolean> {
        const repository = dto.type === 'customer' ? this.customerRepository : this.providerRepository;
        const existingEntry = await repository.findByEmail(dto.email);
        return existingEntry ? true : false;
    }

}