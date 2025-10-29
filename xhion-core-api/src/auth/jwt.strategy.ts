import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  sid?: string;
  rol?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'changeme',
    });
  }

  async validate(payload: JwtPayload) {
    // Adjuntar el usuario a la request
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        rolId: true,
        rol: {
          select: {
            nombre: true,
            permisos: {
              select: {
                permiso: {
                  select: {
                    nombreAccion: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Si el usuario fue eliminado o no existe
    if (!user) {
      return null;
    }

    // Extraer los nombres de los permisos en un array simple
    const permisos = user.rol?.permisos.map((rp) => rp.permiso.nombreAccion) || [];

    return {
      sub: user.id, // Mantener compatibilidad con controllers que usan req.user.sub
      ...user,
      rol: user.rol?.nombre,
      permisos, // Agregar array de permisos
      sessionId: payload.sid,
    }; // se asigna a req.user
  }
}
