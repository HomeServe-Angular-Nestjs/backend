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
import { LOGIN_SERVICE_INTERFACE_NAME, TOKEN_SERVICE_NAME } from '../../../core/constants/service.constant';
import { ILoginService } from '../services/interfaces/login-service.interface';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { IUser } from '../../../core/entities/interfaces/user.entity.interface';
import { prepareResponse } from '../../../core/misc/response.util';
import { ITokenService } from '../services/interfaces/token-service.interface';
import { BACKEND_URL, FRONTEND_URL } from '../../../core/environments/environments';

@Controller('login')
export class LoginController {
  private readonly logger = new Logger(LoginController.name);

  constructor(
    @Inject(LOGIN_SERVICE_INTERFACE_NAME)
    private _loginService: ILoginService,
    @Inject(TOKEN_SERVICE_NAME)
    private _tokenService: ITokenService,
  ) { }

  @Post('auth')
  async validateCredentials(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this._loginService.validateUserCredentials(dto);
      if (dto.type) {
        user['type'] = dto.type;
      }
      const accessToken = this._loginService.generateAccessToken(user);
      if (!accessToken) {
        throw new NotFoundException('Access token is missing');
      }

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

      return { email: user.email, id: user.id, type: user.type };
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

      if (!user || !user.type) {
        throw new NotFoundException('User is missing in the request');
      }

      const accessToken = this._loginService.generateAccessToken(user);
      if (!accessToken) {
        throw new NotFoundException('Access token is missing');
      }

      const refreshToken = await this._loginService.generateRefreshToken(user);
      if (!refreshToken) {
        throw new NotFoundException('Refresh token is missing');
      }

      res.cookie('access_token', accessToken, {
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

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again.',
      );
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const token = req.cookies['access_token'];
      if (token) {
        const decoded = this._tokenService.decode(token);
        if (decoded && typeof decoded === 'object' && decoded.sub) {
          await this._loginService.invalidateRefreshToken(decoded.sub);
        }
      }

      res.clearCookie('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      return res.status(200).json(prepareResponse(true, 'Successful logout'));
    } catch (err) {
      this.logger.error('[ERROR] Logout: ', err);
      throw new InternalServerErrorException('Something went wrong while logging out.');
    }
  }
}
