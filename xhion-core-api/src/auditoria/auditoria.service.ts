import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type AuditDetails = Prisma.InputJsonValue | null;

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrarAccion(
    usuarioId: string | null,
    accion: string,
    detalles: AuditDetails,
    ip: string | null,
  ) {
    try {
      await this.prisma.registroAuditoria.create({
        data: {
          usuarioId: usuarioId ?? undefined,
          accion,
          detalles: detalles ?? undefined,
          direccionIp: ip ?? undefined,
        },
      });
    } catch (error) {
      this.logger.error(`Error registrando auditoría (${accion}): ${error instanceof Error ? error.message : error}`);
    }
  }
}
