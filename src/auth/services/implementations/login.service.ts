import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

import { ICustomerRepository } from "src/auth/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "src/auth/repositories/interfaces/provider-repo.interface";

import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/auth/constants/repository.constant";

import { ILoginService } from "../interfaces/login-service.interface";
import { ITokenService } from "../interfaces/token-service.interface";

import { TOKEN_SERVICE_NAME } from "src/auth/constants/service.constant";

import { Customer } from "src/auth/common/entities/implementation/customer.entity";
import { Provider } from "src/auth/common/entities/implementation/provider.entity";

import { IUser } from "src/auth/common/entities/interfaces/user.entity";
import { IPayload } from "src/auth/dtos/payload.dto";

import { IArgonUtility } from "src/auth/common/utilities/interface/argon.utility.interface";
import { ITokenUtility } from "src/auth/common/utilities/interface/token.utility.interface";
import { IMailerUtility } from "src/auth/common/utilities/interface/mailer.utility.interface";

import { ARGON_UTILITY_NAME, MAILER_UTILITY_INTERFACE_NAME, TOKEN_UTILITY_NAME } from "src/auth/constants/utility.constant";

import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, UserType, VerifyTokenDto } from "src/auth/dtos/login.dto";


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
        private mailerService: IMailerUtility,
        @Inject(TOKEN_SERVICE_NAME)
        private tokenService: ITokenService,
        @Inject(CACHE_MANAGER)
        private cache: Cache

    ) { }

    async validateUserCredentials(dto: AuthLoginDto): Promise<IUser> {
        try {
            const repository = this.findRepo(dto.type);
            const user = await repository.findByEmail(dto.email);

            if (!user || !user.password) {
                throw new UnauthorizedException('Invalid email or password');
            }

            const isValidPassword = await this.argon.verify(user.password, dto.password);
            if (!isValidPassword) throw new UnauthorizedException('Invalid email or password.');

            return user;
        } catch (error) {
            console.error('Credential Validation Error:', error.message);
            if (error instanceof UnauthorizedException) {
                throw error
            }

            throw new InternalServerErrorException('An unexpected error occurred during login.');
        }
    }

    async generateTokens(user: IUser): Promise<string> {
        return this.tokenService.generateToken(user.id, user.email)
    }

    async findOrCreateUser(user: GoogleLoginDto): Promise<IUser> {
        try {
            const repository = this.findRepo(user.type);
            const existingUser = await repository.findByEmail(user.email);

            if (existingUser) {
                return existingUser;
            }

            let newUser: IUser;

            if (user.type === 'customer') {
                newUser = await this.customerRepository.create(new Customer({
                    email: user.email,
                    username: user.name,
                    googleId: user.googleId,
                    isActive: true,
                }));
            } else if (user.type === 'provider') {
                newUser = await this.providerRepository.create(new Provider({
                    email: user.email,
                    username: user.name,
                    googleId: user.googleId,
                    isActive: true,
                }));
            } else {
                throw new BadRequestException('Invalid user type');
            }

            return newUser;

        } catch (err) {
            console.error('Error in findOrCreateUser:', err.message);
            throw new BadRequestException('Failed to create or find user');
        }
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

    private findRepo(type: UserType): IProviderRepository | ICustomerRepository {
        return type === 'customer' ? this.customerRepository : this.providerRepository;
    }
}