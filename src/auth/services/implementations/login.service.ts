import { Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ILoginService } from "../interfaces/login-service.interface";
import { ICustomerRepository } from "src/auth/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "src/auth/repositories/interfaces/provider-repo.interface";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/auth/constants/repository.constant";
import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";
import { ICustomer } from "src/auth/common/entities/interfaces/customer.entity.interface";
import { IProvider } from "src/auth/common/entities/interfaces/provider.entity.interface";
import { IArgonUtility } from "src/auth/common/utilities/interface/argon.utility.interface";
import { ARGON_UTILITY_NAME, MAILER_UTILITY_INTERFACE_NAME, TOKEN_UTILITY_NAME } from "src/auth/constants/utility.constant";
import { ITokenUtility } from "src/auth/common/utilities/interface/token.utility.interface";
import { IMailerUtility } from "src/auth/common/utilities/interface/mailer.utility.interface";
import { IPayload } from "src/auth/dtos/payload.dto";
import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, VerifyTokenDto } from "src/auth/dtos/login.dto";

@Injectable()
export class LoginService implements ILoginService {

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private providerRepository: IProviderRepository,
        @Inject(ARGON_UTILITY_NAME)
        private argon: IArgonUtility,
        @Inject(TOKEN_UTILITY_NAME)
        private token: ITokenUtility,
        @Inject(MAILER_UTILITY_INTERFACE_NAME)
        private mailerService: IMailerUtility
    ) { }

    async authenticateCredentials(dto: AuthLoginDto): Promise<boolean> {
        const repository = this.findRepo(dto.type);
        const user = await repository.findByEmail(dto.email);

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        const isValidPassword = await this.argon.verify(user.password, dto.password);
        if (!isValidPassword) throw new UnauthorizedException('Password does not match.');

        return Promise.resolve(true);
    }

    async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
        const repository = dto.type === 'customer' ? this.customerRepository
            : this.providerRepository;

        const user = await repository.findByEmail(dto.email);
        if (!user) throw new NotFoundException('User not found');

        const token = this.token.generateAccessToken({ ...dto, id: user.id });

        this.mailerService.sendEmail(dto.email, token, 'link');
    }

    async verifyToken(dto: VerifyTokenDto): Promise<IPayload> {
        return await this.token.verifyToken(dto.token);
    }

    async changePassword(dto: ChangePasswordDto): Promise<void> {
        try {
            const repository = this.findRepo(dto.type);
            const hashedPassword = await this.argon.hash(dto.password);

            const updatedUser = await repository.findOneAndUpdate(
                { email: dto.email },
                { $set: { password: hashedPassword } },
            );

            if (!updatedUser) throw new NotFoundException('Not found Exception');
        } catch (err) {
            throw new InternalServerErrorException('Failed to update password');
        }
    }

    private findRepo(type: 'customer' | 'provider'): IProviderRepository | ICustomerRepository {
        return type === 'customer' ? this.customerRepository : this.providerRepository;
    }
}