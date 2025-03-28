import { Body, Controller, Inject, Post } from "@nestjs/common";
import { AuthLoginDto } from "../dtos/login/login.dto";
import { LOGIN_SERVICE_INTERFACE_NAME } from "../constants/service.constant";
import { ILoginService } from "../services/interfaces/login-service.interface";

@Controller('login')
export class LoginController {
    constructor(
        @Inject(LOGIN_SERVICE_INTERFACE_NAME)
        private loginService: ILoginService
    ) { }

    @Post('auth')
    async authCredentials(@Body() dto: AuthLoginDto) {
        await this.loginService.authenticateCredentials(dto);
    }
}