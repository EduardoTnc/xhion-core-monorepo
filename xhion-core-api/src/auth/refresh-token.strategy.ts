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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') ?? config.get<string>('JWT_SECRET') ?? 'changeme',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any): RefreshTokenValidatePayload {
    const authHeader = req.get('authorization') ?? '';
    const refreshToken = authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token faltante');
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
