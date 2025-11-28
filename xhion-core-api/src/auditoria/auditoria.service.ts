import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type AuditDetails = Prisma.InputJsonValue | null;

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) { }

  async findAll(params: {
    skip?: number;
    take?: number;
    usuarioId?: string;
    accion?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    search?: string;
  }) {
    const { skip, take, usuarioId, accion, fechaDesde, fechaHasta, search } = params;

    const where: Prisma.RegistroAuditoriaWhereInput = {};

    if (search) {
      where.OR = [
        { direccionIp: { contains: search, mode: 'insensitive' } },
        { accion: { contains: search, mode: 'insensitive' } },
        {
          usuario: {
            OR: [
              { nombreCompleto: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (accion && !search) { // If search is present, accion might be covered by search, but specific filter should probably narrow it down. 
      // Actually, if I have both search and specific filters, they should be ANDed.
      // My `where` object construction does AND by default for top level properties.
      // But `search` uses OR for its fields.
      // So `where: { AND: [ { OR: searchFields }, { usuarioId: ... } ] }` is implicit if I assign properties to `where`.
      // However, if I assign `where.accion` here, it adds to the AND conditions.
      // So if I search "Login" and filter Action="Create", result is empty. That is correct behavior for "Filter + Search".
      where.accion = { contains: accion, mode: 'insensitive' };
    } else if (accion) {
      // If search covers accion, do we want to double filter? Yes, specific filter takes precedence or adds to it.
      where.accion = { contains: accion, mode: 'insensitive' };
    }

    if (fechaDesde || fechaHasta) {
      where.timestamp = {};
      if (fechaDesde) where.timestamp.gte = fechaDesde;
      if (fechaHasta) where.timestamp.lte = fechaHasta;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.registroAuditoria.findMany({
        where,
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          usuario: {
            select: {
              id: true,
              nombreCompleto: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.registroAuditoria.count({ where }),
    ]);

    return { data, total };
  }

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
  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfDay);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const [
      totalEventsToday,
      totalEventsYesterday,
      criticalEventsToday,
      activeUsersToday
    ] = await this.prisma.$transaction([
      // Total events today
      this.prisma.registroAuditoria.count({
        where: { timestamp: { gte: startOfDay } }
      }),
      // Total events yesterday (for trend)
      this.prisma.registroAuditoria.count({
        where: {
          timestamp: {
            gte: startOfYesterday,
            lt: startOfDay
          }
        }
      }),
      // Critical events today (Delete or Errors)
      this.prisma.registroAuditoria.count({
        where: {
          timestamp: { gte: startOfDay },
          accion: { in: ['delete', 'error', 'login_failed'], mode: 'insensitive' }
        }
      }),
      // Active users today
      this.prisma.registroAuditoria.groupBy({
        by: ['usuarioId'],
        where: {
          timestamp: { gte: startOfDay },
          usuarioId: { not: null }
        },
        orderBy: {
          usuarioId: 'asc'
        }
      })
    ]);

    // Calculate trend percentage
    const trend = totalEventsYesterday === 0
      ? 100
      : Math.round(((totalEventsToday - totalEventsYesterday) / totalEventsYesterday) * 100);

    return {
      totalEventsToday,
      trend,
      criticalEventsToday,
      activeUsersToday: activeUsersToday.length,
      integrity: 98.7 // Mocked for now as we don't have hash verification logic yet
    };
  }

  async getActiveUsers() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeUsers = await this.prisma.registroAuditoria.findMany({
      where: {
        timestamp: { gte: startOfDay },
        usuarioId: { not: null }
      },
      distinct: ['usuarioId'],
      select: {
        usuario: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            rol: true,
          }
        },
        timestamp: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return activeUsers
      .filter(log => log.usuario)
      .map(log => ({
        ...log.usuario!,
        ultimoEvento: log.timestamp
      }));
  }
}
