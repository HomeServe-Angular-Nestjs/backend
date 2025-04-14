import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";

import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";

import { ADMIN_REPOSITORY_INTERFACE_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";

import { ILoginService } from "../interfaces/login-service.interface";
import { ITokenService } from "../interfaces/token-service.interface";

import { TOKEN_SERVICE_NAME } from "../../../../core/constants/service.constant";

import { Customer } from "../../../../core/entities/implementation/customer.entity";
import { Provider } from "../../../../core/entities/implementation/provider.entity";

import { IUser } from "../../../../core/entities/interfaces/user.entity";
import { IPayload } from "../../misc/payload.interface";

import { IArgonUtility } from "../../../../core/utilities/interface/argon.utility.interface";
import { ITokenUtility } from "../../../../core/utilities/interface/token.utility.interface";
import { IMailerUtility } from "../../../../core/utilities/interface/mailer.utility.interface";

import { ARGON_UTILITY_NAME, MAILER_UTILITY_INTERFACE_NAME, TOKEN_UTILITY_NAME } from "../../../../core/constants/utility.constant";

import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, UserType, VerifyTokenDto } from "../../dtos/login.dto";
import { UserReposType } from "../../misc/repo.type";
import { IAdminRepository } from "../../../../core/repositories/interfaces/admin-repo.interface";


@Injectable()
export class LoginService implements ILoginService {

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private providerRepository: IProviderRepository,
        @Inject(ADMIN_REPOSITORY_INTERFACE_NAME)
        private adminRepository: IAdminRepository,
        @Inject(ARGON_UTILITY_NAME)
        private argon: IArgonUtility,
        @Inject(TOKEN_UTILITY_NAME)
        private token: ITokenUtility,
        @Inject(MAILER_UTILITY_INTERFACE_NAME)
        private mailerService: IMailerUtility,
        @Inject(TOKEN_SERVICE_NAME)
        private tokenService: ITokenService,
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
            if (user.type === 'admin') {
                throw new BadRequestException('Google login is not supported for admin users');
            }

            const repository = user.type === 'customer' ? this.customerRepository : this.providerRepository;

            const existingUser = await repository.findByEmail(user.email);

            if (existingUser) {
                if (existingUser.googleId) {
                    return existingUser;
                }

                const updatedUser = await repository.findOneAndUpdate(
                    { email: existingUser.email },
                    { $set: { googleId: user.googleId } },
                    { new: true }
                );

                if (!updatedUser) {
                    throw new InternalServerErrorException('Failed to update user with Google ID');
                }

                return updatedUser;
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

        await this.mailerService.sendEmail(dto.email, token, 'link');
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

    private findRepo(type: UserType): UserReposType {
        if (type === 'customer') {
            return this.customerRepository;
        } else if (type === 'provider') {
            return this.providerRepository;
        } else if (type === 'admin') {
            return this.adminRepository;
        } else {
            throw new BadRequestException('Invalid type Error.');
        }
    }
}