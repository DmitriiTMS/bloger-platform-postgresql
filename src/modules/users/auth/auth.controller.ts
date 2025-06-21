import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request as RequestExpress } from 'express';
import { ExtractUserFromRequest } from './decorators/extract-user-from-request.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @ExtractUserFromRequest() user: {id: string, login: string},
    @Req() req: RequestExpress,
    @Res({passthrough: true}) res: Response
   ): Promise<{ accessToken: string }> {

    const { ip } = req;
    const title = req.headers["user-agent"];

    // const infoDevice: {ip?: string, title?: string} = {ip, title}

    const resultTokens = await this.authService.loginUser(user,
      // infoDevice
    );
    res.cookie('refreshToken', resultTokens.refreshToken, {
      httpOnly: true,
      secure: true, // Для HTTPS
      sameSite: 'strict' // Защита от CSRF
    });
    return {accessToken: resultTokens.accessToken}
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: CreateUserDto) {
    return await this.authService.registerUser(body);
  }
}
