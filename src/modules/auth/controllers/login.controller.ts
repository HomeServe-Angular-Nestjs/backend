import { BadRequestException, Body, Controller, Get, Inject, InternalServerErrorException, NotFoundException, Post, Put, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { LOGIN_SERVICE_INTERFACE_NAME, TOKEN_SERVICE_NAME } from '@core/constants/service.constant';
import { IUser } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { BACKEND_URL, FRONTEND_URL } from '@core/environments/environments';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { prepareResponse } from '@core/misc/response.util';
import { AuthLoginDto, ChangePasswordDto, EmailAndTypeDto, VerifyOtpForgotPassDto } from '@modules/auth/dtos/login.dto';
import { GoogleAuthGuard } from '@modules/auth/guards/google-auth.guard';
import { ILoginService } from '@modules/auth/services/interfaces/login-service.interface';
import { ITokenService } from '@modules/auth/services/interfaces/token-service.interface';

@Controller('login')
export class LoginController {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(LOGIN_SERVICE_INTERFACE_NAME)
    private readonly _loginService: ILoginService,
    @Inject(TOKEN_SERVICE_NAME)
    private readonly _tokenService: ITokenService,
  ) {
    this.logger = this._loggerFactory.createLogger(LoginController.name);
  }

  @Post('auth')
  async validateCredentials(@Body() dto: AuthLoginDto, @Res({ passthrough: true }) response: Response,) {
    const user = await this._loginService.validateUserCredentials(dto);
    if (!user) {
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }

    const accessToken = this._tokenService.generateAccessToken(user.id, user.email, dto.type);
    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    const refreshToken = await this._tokenService.generateRefreshToken(user.id, user.email, dto.type);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });

    return { email: user.email, id: user.id, type: user.type };
  }

  @Post('otp_forgot_password')
  async forgotPassword(@Body() dto: EmailAndTypeDto) {
    return await this._loginService.requestOtpForForgotPassword(dto);
  }

  @Post('verify_otp_forgot')
  async verifyOtpFromForgotPassword(@Body() dto: VerifyOtpForgotPassDto) {
    const { code, email } = dto;
    if (!code || !email) throw new BadRequestException({
      code: ErrorCodes.BAD_REQUEST,
      message: 'otp code or email is missing.'
    })

    return await this._loginService.verifyOtpFromForgotPassword(email, code)
  }

  @Put('change_password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    await this._loginService.changePassword(dto);
  }

  @Get('google/init')
  initializeGoogleAuth(@Query('type') type: string, @Req() req: Request, @Res() res: Response,) {
    try {
      if (!type) {
        return res
          .status(400)
          .json({ success: false, message: 'User Type Is Required.' });
      }

      req.session['userType'] = type;

      const googleAuthUrl = `${BACKEND_URL}/api/login/google`;
      return res.status(200).json({
        success: true,
        message: 'Google Authentication Initialized',
        data: googleAuthUrl,
      });
    } catch (err) {
      this.logger.error('Google Login Error:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again.',
      );
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() { }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = req.user as IUser;

      if (!user || !user.id || !user.type) {
        throw new NotFoundException('User is missing in the request');
      }

      const accessToken = this._tokenService.generateAccessToken(user.id, user.email, user.type);
      if (!accessToken) {
        throw new NotFoundException('Access token is missing');
      }

      const refreshToken = await this._tokenService.generateRefreshToken(user.id, user.email, user.type);
      if (!refreshToken) {
        throw new NotFoundException('Refresh token is missing');
      }

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      const frontendUrl =
        user.type === 'provider'
          ? `${FRONTEND_URL}/provider/dashboard?loggedIn=true&email=${user.email}&id=${user.id}`
          : `${FRONTEND_URL}/homepage?loggedIn=true&email=${user.email}&id=${user.id}`;

      return res.redirect(frontendUrl);
    } catch (error) {
      this.logger.error('Google Login Error:', error.message);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const accessToken = req.cookies['access_token'];
      const refreshToken = req.cookies['refresh_token'];

      if (accessToken) {
        const decoded = this._tokenService.decode(accessToken);
        if (decoded && typeof decoded === 'object' && decoded.sub && refreshToken) {
          await this._tokenService.invalidateTokens(decoded.sub, refreshToken);
        }
      }

      res.clearCookie('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      return res.status(200).json(prepareResponse(true, 'Successful logout'));
    } catch (err) {
      this.logger.error('[ERROR] Logout: ', err);
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }
}
