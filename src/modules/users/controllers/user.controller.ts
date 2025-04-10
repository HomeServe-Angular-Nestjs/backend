import { Controller, Get, Inject, Res, UseInterceptors } from '@nestjs/common';
import { USER_SERVICE_NAME } from '../../../core/constants/service.constant';
import { IUserService } from '../services/interfaces/user-service.interface';
import { Response } from 'express';
import { AuthInterceptor } from '../../auth/interceptors/auth.interceptor';

@Controller()
export class UserController {
    constructor(
        @Inject(USER_SERVICE_NAME)
        private readonly userService: IUserService
    ) { }

    @UseInterceptors(AuthInterceptor)
    @Get(['admin/customers'])
    async getCustomer() {
        const c = await this.userService.getCustomer();
        console.log(c)
        return c;
    }

    @Get(['admin/providers'])
    async getProvider() {
        const p = await this.userService.getProviders();
        console.log(p)
        return p;
    }
}
