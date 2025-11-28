import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { SesionesService } from '../sesiones/sesiones.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sesionesService: SesionesService,
    private readonly auditoriaService: AuditoriaService,
  ) { }

  // MARK: - validateUser
  async validateUser(email: string, pass: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      // Log failed login attempt (optional, might be noisy)
      // await this.auditoriaService.registrarAccion(null, 'Login Failed', { email }, null);
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      // await this.auditoriaService.registrarAccion(user.id, 'Login Failed', { email }, null);
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  // MARK: - login
  async login(user: { id: string; email: string; rolId: string }, request: Request) {
    const sessionId = randomUUID();
    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      sessionId,
    });

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    const { userAgent, ip } = this.extractRequestMetadata(request);

    await this.sesionesService.createSession({
      id: sessionId,
      usuarioId: user.id,
      refreshTokenHash,
      accessToken: tokens.accessToken,
      userAgent,
      direccionIp: ip,
    });

    await this.auditoriaService.registrarAccion(user.id, 'Login', { sessionId, userAgent }, ip);

    return { ...tokens, sessionId };
  }

  // MARK: - refreshToken
  async refreshToken(userId: string, email: string, sessionId: string, refreshToken: string, request: Request) {
    const session = await this.sesionesService.findById(sessionId);
    if (!session || session.usuarioId !== userId) {
      throw new UnauthorizedException('Sesión no válida');
    }

    const isValidRefresh = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isValidRefresh) {
      // Invalida la sesión comprometida
      await this.sesionesService.revokeSession(sessionId, userId);
      await this.auditoriaService.registrarAccion(userId, 'Security Alert', { detail: 'Invalid Refresh Token', sessionId }, null);
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokens = await this.generateTokens({ userId, email, sessionId });
    const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
    const { userAgent, ip } = this.extractRequestMetadata(request);

    await this.sesionesService.updateSession(sessionId, {
      refreshTokenHash: newRefreshHash,
      accessToken: tokens.accessToken,
      userAgent,
      direccionIp: ip,
    });

    return { ...tokens, sessionId };
  }

  // MARK: - logout
  async logout(sessionId: string, userId: string) {
    await this.sesionesService.revokeSession(sessionId, userId);
    await this.auditoriaService.registrarAccion(userId, 'Logout', { sessionId }, null);
    return { success: true };
  }

  // MARK: - acceptInvitation
  async acceptInvitation(
    token: string,
    password: string,
    profileData: { avatarUrl?: string; telefono?: string; fechaNacimiento?: string; biografia?: string },
    request: Request
  ) {
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
            // Actualizar campos opcionales del perfil
            avatarUrl: profileData.avatarUrl || null,
            fechaNacimiento: profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento) : null,
            biografia: profileData.biografia || null,
          },
        });
        userId = updated.id;
      } else {
        const created = await tx.usuario.create({
          data: {
            email: invitacion.email,
            nombreCompleto: invitacion.nombre_completo,
            rolId: invitacion.rol_id,
            puestoTrabajoId: null,
            passwordHash,
            estado: 'ACTIVO',
            // Campos opcionales del perfil
            avatarUrl: profileData.avatarUrl || null,
            fechaNacimiento: profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento) : null,
            biografia: profileData.biografia || null,
          },
        });
        userId = created.id;
      }

      // Si se proporciona teléfono, crear registro de contacto
      if (profileData.telefono) {
        await tx.usuarioContacto.create({
          data: {
            usuarioId: userId,
            tipo: 'telefono_principal',
            valor: profileData.telefono,
          },
        });
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

    const tokens = await this.login(user!, request);
    return { userId: user!.id, ...tokens };
  }

  // MARK: - generateTokens
  private async generateTokens(params: { userId: string; email: string; sessionId: string }) {
    const payload = { sub: params.userId, email: params.email, sid: params.sessionId };
    const accessTtl = this.config.get<string>('ACCESS_TOKEN_TTL') ?? '15m';
    const refreshTtl = this.config.get<string>('REFRESH_TOKEN_TTL') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshTtl,
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? this.config.get<string>('JWT_SECRET') ?? 'changeme',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // MARK: - extractRequestMetadata
  private extractRequestMetadata(request: Request) {
    const userAgent = request.get('user-agent') ?? request.headers['user-agent']?.toString() ?? null;
    const forwarded = request.headers['x-forwarded-for']?.toString();
    const ip = forwarded?.split(',')[0]?.trim() ?? request.ip ?? request.socket?.remoteAddress ?? null;
    return { userAgent, ip };
  }
}
