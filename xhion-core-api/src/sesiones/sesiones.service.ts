import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateSessionInput {
  id: string;
  usuarioId: string;
  refreshTokenHash: string;
  userAgent?: string | null;
  direccionIp?: string | null;
}

interface UpdateSessionInput {
  refreshTokenHash: string;
  userAgent?: string | null;
  direccionIp?: string | null;
}

@Injectable()
export class SesionesService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(input: CreateSessionInput) {
    return this.prisma.sesion.create({
      data: {
        id: input.id,
        usuarioId: input.usuarioId,
        refreshTokenHash: input.refreshTokenHash,
        userAgent: input.userAgent ?? null,
        direccionIp: input.direccionIp ?? null,
      },
    });
  }

  async findById(sessionId: string) {
    return this.prisma.sesion.findUnique({
      where: { id: sessionId },
    });
  }

  async updateSession(sessionId: string, input: UpdateSessionInput) {
    return this.prisma.sesion.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: input.refreshTokenHash,
        userAgent: input.userAgent ?? null,
        direccionIp: input.direccionIp ?? null,
      },
    });
  }

  async listSessions(usuarioId: string) {
    return this.prisma.sesion.findMany({
      where: { usuarioId },
      select: {
        id: true,
        userAgent: true,
        direccionIp: true,
        fechaCreacion: true,
        fechaUltimoUso: true,
      },
      orderBy: {
        fechaUltimoUso: 'desc',
      },
    });
  }

  async revokeSession(sessionId: string, usuarioId: string) {
    const result = await this.prisma.sesion.deleteMany({
      where: {
        id: sessionId,
        usuarioId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Sesión no encontrada');
    }
  }

  async revokeAllSessions(usuarioId: string) {
    await this.prisma.sesion.deleteMany({
      where: { usuarioId },
    });
  }
}
