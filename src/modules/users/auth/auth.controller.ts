import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request as RequestExpress } from 'express';
import { ExtractUserFromRequest } from './decorators/extract-user-from-request.decorator';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RegistrationEmailEesendingDto } from './dto/registration-email-resending.dto';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { RequestUserDecorator } from './decorators/request-user-decorator';
import { UserGetMeViewDto } from './dto/getMe-view.dto';
import { AuthQueryRepository } from './auth-query.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository
  ) {}

  
  @Post('login')
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @ExtractUserFromRequest() user: {id: string, login: string},
    @Req() req: RequestExpress,
    @Res({passthrough: true}) res: Response
   ): Promise<{ accessToken: string }> {

    const { ip } = req;
    const title = req.headers["user-agent"];

    const infoDevice: {ip?: string, title?: string} = {ip, title}

    const resultTokens = await this.authService.loginUser(user,
      infoDevice
    );
    res.cookie('refreshToken', resultTokens.refreshToken, {
      httpOnly: true,
      secure: true, // Для HTTPS
      sameSite: 'strict' // Защита от CSRF
    });
    return {accessToken: resultTokens.accessToken}
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: PasswordRecoveryDto) {
    return await this.authService.passwordRecovery(body.email);
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: NewPasswordDto) {
    return await this.authService.newPassword(body);
  }

  
  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: RegistrationConfirmationDto) {
    return await this.authService.registrationConfirmation(body)
  }

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: CreateUserDto) {
    return await this.authService.registerUser(body);
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: RegistrationEmailEesendingDto) {
    return await this.authService.registrationEmailResending(body)
  }

  
  @Post('refresh-token')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: RequestExpress,
    @Res({passthrough: true}) res: Response
  ) {
    const { refreshToken } = req.cookies
    const tokens = await this.authService.refreshToken(refreshToken)
    res.cookie('refreshToken', tokens.newRefreshToken, {
      httpOnly: true,
      secure: true, // Для HTTPS
      sameSite: 'strict' // Защита от CSRF
    });
    return {accessToken: tokens.newAccessToken}
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: RequestExpress) {
    const { refreshToken } = req.cookies
    return await this.authService.logout(refreshToken)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@RequestUserDecorator() user: { userId: string }): Promise<UserGetMeViewDto> {
    return await this.authQueryRepository.getMe(user?.userId);
  }

}
