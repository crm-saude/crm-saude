import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: { name: string; email: string; password: string; clinicName: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(
      body.name,
      body.email,
      body.password,
      body.clinicName,
    );
    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return result;
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);
    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logout realizado' };
  }
}
