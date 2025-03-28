import { Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ILoginService } from "../interfaces/login-service.interface";
import { AuthLoginDto } from "src/auth/dtos/login/login.dto";
import { ICustomerRepository } from "src/auth/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "src/auth/repositories/interfaces/provider-repo.interface";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/auth/constants/repository.constant";
import { IBaseRepository } from "src/auth/common/repositories/interfaces/base-repo.interface";
import { ICustomer } from "src/auth/common/interfaces/customer.entity.interface";
import { IProvider } from "src/auth/common/interfaces/provider.entity.interface";
import { IArgonUtility } from "src/auth/common/utilities/interface/argon.utility.interface";
import { ARGON_UTILITY_NAME } from "src/auth/constants/utility.constant";

@Injectable()
export class LoginService implements ILoginService {

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private providerRepository: IProviderRepository,
        @Inject(ARGON_UTILITY_NAME)
        private argon: IArgonUtility
    ) { }

    async authenticateCredentials(dto: AuthLoginDto): Promise<boolean> {

        const repository: IBaseRepository<ICustomer | IProvider> = dto.type === 'customer'
            ? this.customerRepository : this.providerRepository;

        const user = await repository.findByEmail(dto.email);

        if (!user) {
            throw new NotFoundException('Email not found.');
        }

        const isValidPassword = await this.argon.verify(user.password, dto.password);
        if (!isValidPassword) throw new UnauthorizedException('Password does not match.')

        return Promise.resolve(true);
    }
}