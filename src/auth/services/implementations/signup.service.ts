import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { CompleteSignupDto } from "../../dtos/complete-signup.dto";
import { ISignupService } from "../interfaces/signup-service.interface";
import { ICustomerRepository } from "src/auth/repositories/interfaces/customer-repo.interface";
import { IOtpService } from "../interfaces/otp-service.interface";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, } from "src/auth/constants/repository.constant";
import { Customer } from "src/auth/common/entities/customer.entity";
import { IArgonUtility } from "src/auth/common/utilities/interface/argon.utility.interface";
import { OTP_SERVICE_INTERFACE_NAME } from "src/auth/constants/service.constant";
import { ARGON_UTILITY_NAME } from "src/auth/constants/utility.constant";

@Injectable()
export class SignupService implements ISignupService {

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly customerRepository: ICustomerRepository,
        @Inject(OTP_SERVICE_INTERFACE_NAME)
        private readonly otpService: IOtpService,
        @Inject(ARGON_UTILITY_NAME)
        private readonly argon: IArgonUtility
    ) { }

    // Initiates signup
    async initiateSignup(email: string): Promise<void> {

        // Checking if already exists.
        const exitingCustomer = await this.customerRepository.findByEmail(email);
        if (exitingCustomer) throw new ConflictException('Email already exists.');

        // Generate and sends otp.
        await this.otpService.generateAndSendOtp(email);
    }

    async completeSignup(dto: CompleteSignupDto): Promise<void> {
        const hashedPassword = await this.argon.hash(dto.password);
        const customer = new Customer({
            email: dto.email,
            username: dto.username,
            password: hashedPassword,
            isActive: true,
        });
        await this.customerRepository.create(customer);
    }



}