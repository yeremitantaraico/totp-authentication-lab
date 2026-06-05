import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { JsonStorageService } from '../storage/json-storage.service';
import { PublicUser, StoredUser } from '../storage/types/user.types';
import { TotpService } from './totp.service';

interface JwtPayload {
  sub: string;
  purpose?: 'access' | 'totp-pending';
}

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'totp-lab-dev-secret-change-me';
  private readonly accessTokenTtl = '1h';
  private readonly tempTokenTtl = '5m';

  constructor(
    private readonly storage: JsonStorageService,
    private readonly totpService: TotpService,
  ) {}

  private toPublicUser(user: StoredUser): PublicUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      totpEnabled: user.totpEnabled,
      totpAccountName: user.totpAccountName ?? null,
      showTotpSetupPrompt:
        !user.totpEnabled && !user.totpSetupPromptDismissed,
    };
  }

  private signToken(
    userId: string,
    purpose: JwtPayload['purpose'],
    expiresIn: string,
  ): string {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
    return jwt.sign({ sub: userId, purpose }, this.jwtSecret, options);
  }

  private verifyToken(token: string, expectedPurpose?: JwtPayload['purpose']) {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

      if (expectedPurpose && payload.purpose !== expectedPurpose) {
        throw new UnauthorizedException('Token inválido');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async login(email: string, password: string) {
    const user = await this.storage.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.totpEnabled) {
      const tempToken = this.signToken(user.id, 'totp-pending', this.tempTokenTtl);
      return {
        requiresTotp: true,
        tempToken,
      };
    }

    const accessToken = this.signToken(user.id, 'access', this.accessTokenTtl);

    return {
      requiresTotp: false,
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  async verifyTotpLogin(tempToken: string, code: string) {
    const payload = this.verifyToken(tempToken, 'totp-pending');
    const user = await this.storage.findUserById(payload.sub);

    if (!user || !user.totpEnabled || !user.totpSecret) {
      throw new UnauthorizedException('Autenticación inválida');
    }

    const isValid = this.totpService.verifyCode(user.totpSecret, code);

    if (!isValid) {
      throw new UnauthorizedException('Código TOTP inválido');
    }

    const accessToken = this.signToken(user.id, 'access', this.accessTokenTtl);

    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  async getProfileFromToken(token: string): Promise<PublicUser> {
    const payload = this.verifyToken(token, 'access');
    const user = await this.storage.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.toPublicUser(user);
  }

  async setupTotp(userId: string, accountName: string) {
    const user = await this.storage.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.totpEnabled) {
      throw new BadRequestException('TOTP ya está habilitado');
    }

    const normalizedAccountName = accountName.trim();
    const secret = this.totpService.createSecret();

    await this.storage.updateUser(userId, {
      totpPendingSecret: secret,
      totpPendingAccountName: normalizedAccountName,
    });

    const qrDataUrl = await this.totpService.createQrDataUrl(
      normalizedAccountName,
      secret,
    );

    return {
      qrDataUrl,
      manualEntryKey: secret,
      accountName: normalizedAccountName,
      issuer: this.totpService.getIssuer(),
    };
  }

  async enableTotp(userId: string, code: string) {
    const user = await this.storage.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.totpEnabled) {
      throw new BadRequestException('TOTP ya está habilitado');
    }

    if (!user.totpPendingSecret) {
      throw new BadRequestException(
        'Debe generar el código QR antes de habilitar TOTP',
      );
    }

    const isValid = this.totpService.verifyCode(user.totpPendingSecret, code);

    if (!isValid) {
      throw new BadRequestException('Código TOTP inválido');
    }

    const updated = await this.storage.updateUser(userId, {
      totpEnabled: true,
      totpSecret: user.totpPendingSecret,
      totpPendingSecret: null,
      totpAccountName: user.totpPendingAccountName ?? user.fullName,
      totpPendingAccountName: null,
    });

    if (!updated) {
      throw new BadRequestException('No se pudo habilitar TOTP');
    }

    return {
      user: this.toPublicUser(updated),
    };
  }

  async disableTotp(userId: string, password: string, code: string) {
    const user = await this.storage.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.totpEnabled || !user.totpSecret) {
      throw new BadRequestException('TOTP no está habilitado');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const isValid = this.totpService.verifyCode(user.totpSecret, code);

    if (!isValid) {
      throw new BadRequestException('Código TOTP inválido');
    }

    const updated = await this.storage.updateUser(userId, {
      totpEnabled: false,
      totpSecret: null,
      totpPendingSecret: null,
      totpAccountName: null,
      totpPendingAccountName: null,
    });

    if (!updated) {
      throw new BadRequestException('No se pudo deshabilitar TOTP');
    }

    return {
      user: this.toPublicUser(updated),
    };
  }

  async dismissTotpPrompt(userId: string) {
    const updated = await this.storage.updateUser(userId, {
      totpSetupPromptDismissed: true,
    });

    if (!updated) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return {
      user: this.toPublicUser(updated),
    };
  }
}
