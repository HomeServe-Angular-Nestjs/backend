import { Body, Controller, HttpCode, Inject, Post, Put, UnauthorizedException } from "@nestjs/common";
import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, VerifyTokenDto } from "../dtos/login.dto";
import { LOGIN_SERVICE_INTERFACE_NAME } from "../constants/service.constant";
import { ILoginService } from "../services/interfaces/login-service.interface";
@Controller('login')
export class LoginController {
    constructor(
        @Inject(LOGIN_SERVICE_INTERFACE_NAME)
        private loginService: ILoginService,
    ) { }

    @Post('auth')
    @HttpCode(200)
    async authCredentials(@Body() dto: AuthLoginDto) {
        await this.loginService.authenticateCredentials(dto);
    }

    @Post('forgot_password')
    @HttpCode(200)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.loginService.forgotPassword(dto);
    }

    @Post('verify_token')
    @HttpCode(200)
    async verifyToken(@Body() dto: VerifyTokenDto) {
        try {
            return await this.loginService.verifyToken(dto);
        } catch (err) {
            throw new UnauthorizedException('Token Verification Failed');
        }
    }

    @Put('change_password')
    async changePassword(@Body() dto: ChangePasswordDto) {
        this.loginService.changePassword(dto)
    }

}