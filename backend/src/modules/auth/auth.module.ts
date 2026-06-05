import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { TotpService } from './totp.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TotpService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
