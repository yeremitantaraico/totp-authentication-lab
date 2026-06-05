import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      status: 'ok',
      name: process.env.API_NAME?.trim() || 'TOTP Authentication Lab',
      description:
        process.env.API_DESCRIPTION?.trim() ||
        'TOTP Authentication Lab API',
      version: process.env.API_VERSION?.trim() || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
