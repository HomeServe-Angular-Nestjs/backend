import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  InternalServerErrorException,
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

@Controller('login')
export class LoginController {
  constructor(
    @Inject(LOGIN_SERVICE_INTERFACE_NAME)
    private loginService: ILoginService,
  ) {}

  @Post('auth')
  @HttpCode(200)
  async validateCredentials(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.loginService.validateUserCredentials(dto);
      const accessToken = await this.loginService.generateTokens(user);

      const accessKey = getAccessKey(dto.type);

      response.cookie(accessKey, accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      return { success: true, message: 'Login Successful' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Login Error:', error.message);
      } else {
        console.error('Unknown login error:', error);
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
    await this.loginService.forgotPassword(dto);
  }

  @Post('verify_token')
  @HttpCode(200)
  async verifyToken(@Body() dto: VerifyTokenDto) {
    try {
      return await this.loginService.verifyToken(dto);
    } catch (err) {
      console.error('Google Login Error:', err);
      throw new UnauthorizedException('Token Verification Failed');
    }
  }

  @Put('change_password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    await this.loginService.changePassword(dto);
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
      console.error('Google Login Error:', err);
      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again.',
      );
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  handleGoogleLogin() {}

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

      const accessToken = await this.loginService.generateTokens(user);

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
      console.error('Google Login Error:', error.message);

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
      console.log(accessKey);
      res.clearCookie(accessKey, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      console.log('[ERROR] Logout: ', err);
      throw new InternalServerErrorException('Something went wrong.');
    }
  }
}
