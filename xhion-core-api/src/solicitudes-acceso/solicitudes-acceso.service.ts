import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { ReviewSolicitudDto } from './dto/review-solicitud.dto';
import { EstadoSolicitud } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class SolicitudesAccesoService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Crear una nueva solicitud de acceso
   */
  async create(createSolicitudDto: CreateSolicitudDto, ipAddress?: string) {
    // Verificar si ya existe una solicitud pendiente con el mismo email
    const solicitudExistente = await this.prisma.solicitudAcceso.findFirst({
      where: {
        email: createSolicitudDto.email,
        estado: EstadoSolicitud.Pendiente,
      },
    });

    if (solicitudExistente) {
      throw new ConflictException(
        'Ya existe una solicitud pendiente con este email. Por favor espera la revisión.'
      );
    }

    // Verificar si el email ya está registrado como usuario
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: createSolicitudDto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException(
        'Este email ya está registrado en el sistema. Por favor inicia sesión.'
      );
    }

    // Crear la solicitud con expiración de 30 días
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);

    const solicitud = await this.prisma.solicitudAcceso.create({
      data: {
        ...createSolicitudDto,
        fechaExpiracion,
        ipSolicitud: ipAddress,
      },
    });

    // Enviar email de confirmación al solicitante
    await this.emailService.sendSolicitudRecibida(solicitud);

    // Obtener emails de administradores con permiso de invitar
    const admins = await this.prisma.usuario.findMany({
      where: {
        rol: {
          permisos: {
            some: {
              permiso: {
                nombreAccion: 'usuarios.invitar',
              },
            },
          },
        },
      },
      select: {
        email: true,
      },
    });

    const adminEmails = admins.map(admin => admin.email);
    if (adminEmails.length > 0) {
      // Notificar a administradores (sin bloquear)
      this.emailService.notifyAdminsNewSolicitud(solicitud, adminEmails).catch(err => {
        console.error('Error al notificar administradores:', err);
      });
    }

    return solicitud;
  }

  /**
   * Obtener todas las solicitudes con filtros
   */
  async findAll(estado?: string) {
    return this.prisma.solicitudAcceso.findMany({
      where: estado ? { estado: estado as any } : undefined,
      include: {
        revisadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        invitacion: {
          select: {
            id: true,
            token: true,
            fecha_expiracion: true,
            fue_utilizada: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  /**
   * Obtener una solicitud por ID
   */
  async findOne(id: string) {
    const solicitud = await this.prisma.solicitudAcceso.findUnique({
      where: { id },
      include: {
        revisadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
            avatarUrl: true,
          },
        },
        invitacion: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return solicitud;
  }

  /**
   * Revisar una solicitud (aprobar o rechazar)
   */
  async review(id: string, reviewDto: ReviewSolicitudDto, revisadoPorId: string) {
    const solicitud = await this.findOne(id);

    // Verificar que la solicitud esté pendiente
    if (solicitud.estado !== EstadoSolicitud.Pendiente) {
      throw new BadRequestException('Solo se pueden revisar solicitudes pendientes');
    }

    // Verificar si está expirada
    if (new Date() > solicitud.fechaExpiracion) {
      await this.prisma.solicitudAcceso.update({
        where: { id },
        data: { estado: EstadoSolicitud.Expirada },
      });
      throw new BadRequestException('Esta solicitud ha expirado');
    }

    // Si se aprueba, crear una invitación
    let invitacionId: string | undefined;

    if (reviewDto.estado === EstadoSolicitud.Aprobada) {
      if (!reviewDto.rolId) {
        throw new BadRequestException('Debe especificar un rol para aprobar la solicitud');
      }

      // Generar token único para la invitación
      const token = this.generateInvitationToken();
      const fechaExpiracionInvitacion = new Date();
      fechaExpiracionInvitacion.setDate(fechaExpiracionInvitacion.getDate() + 7); // 7 días para aceptar

      const invitacion = await this.prisma.invitacion.create({
        data: {
          nombre_completo: solicitud.nombreCompleto,
          email: solicitud.email,
          rol_id: reviewDto.rolId,
          departamento_id: reviewDto.departamentoId,
          token,
          fecha_expiracion: fechaExpiracionInvitacion,
          invitado_por_id: revisadoPorId,
        },
      });

      invitacionId = invitacion.id;
    }

    // Actualizar la solicitud
    const solicitudActualizada = await this.prisma.solicitudAcceso.update({
      where: { id },
      data: {
        estado: reviewDto.estado,
        revisadoPorId,
        fechaRevision: new Date(),
        comentarioRevision: reviewDto.comentarioRevision,
        invitacionId,
      },
      include: {
        revisadoPor: {
          select: {
            id: true,
            nombreCompleto: true,
            email: true,
          },
        },
        invitacion: true,
      },
    });

    // Enviar email según el estado
    if (reviewDto.estado === EstadoSolicitud.Aprobada && solicitudActualizada.invitacion) {
      await this.emailService.sendSolicitudAprobada(
        solicitudActualizada as any,
        reviewDto.comentarioRevision,
      );
    } else if (reviewDto.estado === EstadoSolicitud.Rechazada) {
      await this.emailService.sendSolicitudRechazada(
        solicitudActualizada,
        reviewDto.comentarioRevision,
      );
    }

    return solicitudActualizada;
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  async getStats() {
    const [total, pendientes, aprobadas, rechazadas, expiradas] = await Promise.all([
      this.prisma.solicitudAcceso.count(),
      this.prisma.solicitudAcceso.count({ where: { estado: EstadoSolicitud.Pendiente } }),
      this.prisma.solicitudAcceso.count({ where: { estado: EstadoSolicitud.Aprobada } }),
      this.prisma.solicitudAcceso.count({ where: { estado: EstadoSolicitud.Rechazada } }),
      this.prisma.solicitudAcceso.count({ where: { estado: EstadoSolicitud.Expirada } }),
    ]);

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
      expiradas,
    };
  }

  /**
   * Marcar solicitudes expiradas automáticamente
   */
  async markExpiredRequests() {
    const result = await this.prisma.solicitudAcceso.updateMany({
      where: {
        estado: EstadoSolicitud.Pendiente,
        fechaExpiracion: {
          lt: new Date(),
        },
      },
      data: {
        estado: EstadoSolicitud.Expirada,
      },
    });

    return { updated: result.count };
  }

  /**
   * Generar token único para invitación
   */
  private generateInvitationToken(): string {
    const randomBytes = require('crypto').randomBytes(32);
    return randomBytes.toString('hex');
  }
}
