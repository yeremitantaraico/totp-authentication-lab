import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { DisableTotpDto } from './dto/disable-totp.dto';
import { EnableTotpDto } from './dto/enable-totp.dto';
import { LoginDto } from './dto/login.dto';
import { SetupTotpDto } from './dto/setup-totp.dto';
import { VerifyTotpDto } from './dto/verify-totp.dto';
import { AuthGuard } from './guards/auth.guard';

interface AuthenticatedRequest extends Request {
  accessToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.authService.login(body.email, body.password);
    return { status: 'success', data: result };
  }

  @Post('verify-totp')
  async verifyTotp(@Body() body: VerifyTotpDto) {
    const result = await this.authService.verifyTotpLogin(
      body.tempToken,
      body.code,
    );
    return { status: 'success', data: result };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: AuthenticatedRequest) {
    const user = await this.authService.getProfileFromToken(
      request.accessToken,
    );
    return { status: 'success', data: { user } };
  }

  @Post('totp/setup')
  @UseGuards(AuthGuard)
  async setupTotp(
    @Req() request: AuthenticatedRequest,
    @Body() body: SetupTotpDto,
  ) {
    const user = await this.authService.getProfileFromToken(
      request.accessToken,
    );
    const setup = await this.authService.setupTotp(user.id, body.accountName);
    return { status: 'success', data: setup };
  }

  @Post('totp/enable')
  @UseGuards(AuthGuard)
  async enableTotp(
    @Req() request: AuthenticatedRequest,
    @Body() body: EnableTotpDto,
  ) {
    const user = await this.authService.getProfileFromToken(
      request.accessToken,
    );
    const result = await this.authService.enableTotp(user.id, body.code);
    return { status: 'success', data: result };
  }

  @Post('totp/disable')
  @UseGuards(AuthGuard)
  async disableTotp(
    @Req() request: AuthenticatedRequest,
    @Body() body: DisableTotpDto,
  ) {
    const user = await this.authService.getProfileFromToken(
      request.accessToken,
    );
    const result = await this.authService.disableTotp(
      user.id,
      body.password,
      body.code,
    );
    return { status: 'success', data: result };
  }

  @Post('totp/dismiss-prompt')
  @UseGuards(AuthGuard)
  async dismissPrompt(@Req() request: AuthenticatedRequest) {
    const user = await this.authService.getProfileFromToken(
      request.accessToken,
    );
    const result = await this.authService.dismissTotpPrompt(user.id);
    return { status: 'success', data: result };
  }
}
