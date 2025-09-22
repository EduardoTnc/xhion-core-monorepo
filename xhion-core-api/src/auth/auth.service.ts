import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  async login(user: { id: string; email: string; rolId: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessTtl = this.config.get<string>('ACCESS_TOKEN_TTL') ?? '15m';
    const refreshTtl = this.config.get<string>('REFRESH_TOKEN_TTL') ?? '7d';
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessTtl,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshTtl,
    });
    return { accessToken, refreshToken };
  }

  async acceptInvitation(token: string, password: string) {
    const invitacion = await this.prisma.invitacion.findUnique({ where: { token } });
    if (!invitacion) {
      throw new BadRequestException('Invitación inválida');
    }
    if (invitacion.fue_utilizada) {
      throw new BadRequestException('La invitación ya fue utilizada');
    }
    if (new Date(invitacion.fecha_expiracion) < new Date()) {
      throw new BadRequestException('La invitación ha expirado');
    }

    // Si existe usuario con ese email y ya está ACTIVO con password, rechazar
    const existingUser = await this.prisma.usuario.findUnique({ where: { email: invitacion.email } });
    if (existingUser && existingUser.passwordHash) {
      throw new BadRequestException('El usuario ya fue registrado previamente');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      let userId: string;
      if (existingUser) {
        const updated = await tx.usuario.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            estado: 'ACTIVO',
          },
        });
        userId = updated.id;
      } else {
        const created = await tx.usuario.create({
          data: {
            email: invitacion.email,
            nombreCompleto: invitacion.email.split('@')[0], // TODO: origen real del nombre si está disponible
            rolId: invitacion.rol_id,
            puestoTrabajoId: null,
            passwordHash,
            estado: 'ACTIVO',
          },
        });
        userId = created.id;
      }

      await tx.invitacion.update({
        where: { id: invitacion.id },
        data: { fue_utilizada: true },
      });

      return userId;
    });

    const user = await this.prisma.usuario.findUnique({
      where: { id: result },
      select: { id: true, email: true, rolId: true },
    });

    return this.login(user!);
  }
}
