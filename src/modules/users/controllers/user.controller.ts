import { Controller, Get, Inject, Req, Res, UseInterceptors } from '@nestjs/common';
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
    async getCustomer(@Req() req: Request) {
        // if (!req.user) {

        // }
        return await this.userService.getCustomer();
    }

    @Get(['admin/providers'])
    async getProvider() {
        return await this.userService.getProviders();
    }
}
