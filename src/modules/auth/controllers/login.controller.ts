import { Body, Controller, Get, HttpCode, Inject, InternalServerErrorException, NotFoundException, Post, Put, Query, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, VerifyTokenDto } from "../dtos/login.dto";
import { LOGIN_SERVICE_INTERFACE_NAME } from "../../../core/constants/service.constant";
import { ILoginService } from "../services/interfaces/login-service.interface";
import { Request, Response } from "express";
import { GoogleAuthGuard } from "../guards/google-auth.guard";
import { IUser } from "../../../core/entities/interfaces/user.entity";

@Controller('login')
export class LoginController {
    constructor(
        @Inject(LOGIN_SERVICE_INTERFACE_NAME)
        private loginService: ILoginService,
    ) { }

    @Post('auth')
    @HttpCode(200)
    async validateCredentials(
        @Body() dto: AuthLoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        try {
            const user = await this.loginService.validateUserCredentials(dto);
            const accessToken = await this.loginService.generateTokens(user);
            console.log(user)
            console.log(accessToken)

            response.cookie(
                dto.type === 'customer'
                    ? 'C_access_token'
                    : dto.type === 'provider'
                        ? 'P_access_token'
                        : 'A_access_token',
                accessToken,
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 10 * 60 * 1000,
                    path: '/'
                });

            return { success: true, message: 'Login Successful' };

        } catch (error) {
            console.error('Login Error:', error.message);

            if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
                throw error;
            }

            throw new InternalServerErrorException('An unexpected error occurred. Please try again.');
        }
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

    @Get('google/init')
    initializeGoogleAuth(@Query('type') type: string, @Req() req: Request, @Res() res: Response) {

        try {
            if (!type) {
                return res.status(400).json({ success: false, message: 'User Type Is Required.' });
            }

            req.session['userType'] = type;

            const googleAuthUrl = 'http://localhost:5000/login/google';
            return res.status(200).json({
                success: true,
                message: 'Google Authentication Initialized',
                data: googleAuthUrl
            });
        } catch (error) {
            console.error('Google Login Error:', error.message);
            throw new InternalServerErrorException('An unexpected error occurred. Please try again.');
        }
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    handleGoogleLogin(@Query('type') type: string, @Req() req: Request) { }

    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    async handleGoogleRedirect(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        try {
            const user = req.user as IUser;

            if (!user) {
                throw new NotFoundException('User is missing in the request')
            }

            const accessToken = await this.loginService.generateTokens(user);

            if (!accessToken) {
                throw new NotFoundException('Missing Access Token');
            }

            res.cookie(
                user.type === 'customer' ? 'C_access_token' : 'P_access_token',
                accessToken,
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 10 * 60 * 1000,
                    path: '/'
                });

            const params = new URLSearchParams({
                email: user.email,
                type: user.type ? user.type.toString() : '',
            }).toString();

            console.log(params)

            const frontendRedirectUrl = user.type === 'customer'
                ? `http://localhost:4200/homepage?${params}`
                : `http://localhost:4200/${user.type}/homepage?${params}`;
            return res.redirect(frontendRedirectUrl);
        } catch (error) {
            console.error('Google Login Error:', error.message);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('An unexpected error occurred. Please try again.');
        }
    }
}