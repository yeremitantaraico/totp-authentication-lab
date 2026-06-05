import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class TotpService {
  private readonly issuer =
    process.env.API_NAME?.trim() || 'TOTP Authentication Lab';

  createSecret(): string {
    return generateSecret();
  }

  getIssuer(): string {
    return this.issuer;
  }

  buildOtpAuthUri(accountName: string, secret: string): string {
    return generateURI({
      issuer: this.issuer,
      label: accountName.trim(),
      secret,
    });
  }

  async createQrDataUrl(
    accountName: string,
    secret: string,
  ): Promise<string> {
    const uri = this.buildOtpAuthUri(accountName, secret);
    return QRCode.toDataURL(uri);
  }

  verifyCode(secret: string, code: string): boolean {
    const result = verifySync({ secret, token: code });
    return result.valid;
  }
}
