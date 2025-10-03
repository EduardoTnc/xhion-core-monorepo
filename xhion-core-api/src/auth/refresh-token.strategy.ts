import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

export interface RefreshTokenValidatePayload {
  userId: string;
  email: string;
  sessionId: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly config: ConfigService) {
    super({
      // Extrae el token del campo 'refreshToken' del cuerpo JSON de la petición
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') ?? config.get<string>('JWT_SECRET') ?? 'changeme',
      passReqToCallback: true, // Pasa el objeto 'req' completo al callback 'validate'
    });
  }

  validate(req: Request, payload: any): RefreshTokenValidatePayload {
    // Obtener el refresh token del cuerpo de la petición
    const refreshToken = req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token faltante en el cuerpo de la petición');
    }

    if (!payload?.sid) {
      throw new UnauthorizedException('Sesión inválida');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
      refreshToken,
    };
  }
}
