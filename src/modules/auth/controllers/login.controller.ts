import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  AuthLoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LogoutDto,
  VerifyTokenDto,
} from '../dtos/login.dto';
import { LOGIN_SERVICE_INTERFACE_NAME } from '../../../core/constants/service.constant';
import { ILoginService } from '../services/interfaces/login-service.interface';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { IUser } from '../../../core/entities/interfaces/user.entity.interface';
import { getAccessKey } from '../interceptors/auth.interceptor';
import { IResponse, prepareResponse } from '../../../core/misc/response.util';

@Controller('api/login')
export class LoginController {
  private readonly logger = new Logger(LoginController.name);

  constructor(
    @Inject(LOGIN_SERVICE_INTERFACE_NAME)
    private _loginService: ILoginService,
  ) { }

  @Post('auth')
  @HttpCode(200)
  async validateCredentials(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this._loginService.validateUserCredentials(dto);
      const accessToken = this._loginService.generateAccessToken(user);
      if (!accessToken) {
        throw new NotFoundException('Access token is missing');
      }

      console.log(accessToken)

      const refreshToken = await this._loginService.generateRefreshToken(user);
      if (!refreshToken) {
        throw new NotFoundException('Refresh token is missing');
      }

      response.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      return prepareResponse(true, 'Login Successful');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Login Error:', error.message);

      } else {
        this.logger.error('Unknown login error:', error);
      }

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again.',
      );
    }
  }

  @Post('forgot_password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this._loginService.forgotPassword(dto);
  }

  @Post('verify_token')
  @HttpCode(200)
  async verifyToken(@Body() dto: VerifyTokenDto) {
    try {
      return await this._loginService.verifyToken(dto);
    } catch (err) {
      this.logger.error('Google Login Error:', err);
      throw new UnauthorizedException('Token Verification Failed');
    }
  }

  @Put('change_password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    await this._loginService.changePassword(dto);
  }

  @Get('google/init')
  initializeGoogleAuth(
    @Query('type') type: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!type) {
        return res
          .status(400)
          .json({ success: false, message: 'User Type Is Required.' });
      }

      req.session['userType'] = type;

      const googleAuthUrl = 'http://localhost:5000/login/google';
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

      if (!user || !user.type) {
        throw new NotFoundException('User is missing in the request');
      }

      const accessToken = await this._loginService.generateTokens(user);

      if (!accessToken) {
        throw new NotFoundException('Missing Access Token');
      }

      const accessKey = getAccessKey(user.type);
      res.cookie(accessKey, accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      const frontendUrl =
        user.type === 'provider'
          ? `http://localhost:4200/provider/dashboard?loggedIn=true&email=${user.email}`
          : `http://localhost:4200/homepage?loggedIn=true&email=${user.email}`;

      return res.redirect(frontendUrl);
    } catch (error) {
      this.logger.error('Google Login Error:', error.message);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again.',
      );
    }
  }

  @Post('logout')
  logout(@Body() dto: LogoutDto, @Res() res: Response) {
    try {
      if (!dto.userType) {
        throw new BadRequestException('User type is not found');
      }

      const accessKey = getAccessKey(dto.userType);
      this.logger.log(accessKey);
      res.clearCookie(accessKey, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      this.logger.log('[ERROR] Logout: ', err);
      throw new InternalServerErrorException('Something went wrong.');
    }
  }
}
