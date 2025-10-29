import { Injectable } from '@nestjs/common';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { AceptarInvitacionDto, CompletarRegistroPorAdminDto } from './dto/aceptar-invitacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InvitacionesService {

  constructor(private readonly prismaService: PrismaService) {}

  create(createInvitacionDto: CreateInvitacionDto) {
    return this.createSecureInvitation(createInvitacionDto);
  }

  private async createSecureInvitation(dto: CreateInvitacionDto) {
    // Validar que no exista un usuario ACTIVO con el mismo email
    const existingUser = await this.prismaService.usuario.findUnique({
      where: { email: dto.email },
      select: { id: true, estado: true },
    });
    if (existingUser && existingUser.estado === 'ACTIVO') {
      throw new BadRequestException('El email ya pertenece a un usuario activo.');
    }

    // Generar token seguro de 32 bytes en hex
    const token = randomBytes(32).toString('hex');

    const invitacion = await this.prismaService.invitacion.create({
      data: {
        email: dto.email,
        nombre_completo: dto.nombre_completo,
        rol_id: dto.rol_id,
        departamento_id: dto.departamento_id ?? null,
        token,
        fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000),
        invitado_por_id: dto.invitado_por_id,
      },
    });

    // Construir URL de invitación completa
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const invitationUrl = `${frontendUrl}/aceptar-invitacion?token=${token}`;

    // Retornar invitación con URL generada
    return {
      ...invitacion,
      invitationUrl,
    };
  }

  async findByToken(token: string) {
    const invitacion = await this.prismaService.invitacion.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        nombre_completo: true,
        rol_id: true,
        departamento_id: true,
        token: true,
        fecha_expiracion: true,
        fue_utilizada: true,
        fecha_utilizacion: true,
        invitado_por_id: true,
        fecha_creacion: true,
      },
    });

    if (!invitacion) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitacion.fue_utilizada) {
      throw new BadRequestException(
        `Esta invitación ya fue utilizada el ${invitacion.fecha_utilizacion ? new Date(invitacion.fecha_utilizacion).toLocaleString('es-ES') : 'fecha desconocida'}`,
      );
    }

    if (new Date(invitacion.fecha_expiracion) < new Date()) {
      throw new BadRequestException('Esta invitación ha expirado');
    }

    return invitacion;
  }

  /**
   * Aceptar invitación - El usuario invitado completa su registro
   */
  async aceptarInvitacion(dto: AceptarInvitacionDto) {
    // Validar invitación
    const invitacion = await this.findByToken(dto.token);

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Crear usuario en una transacción
    const usuario = await this.prismaService.$transaction(async (prisma) => {
      // Crear usuario
      const nuevoUsuario = await prisma.usuario.create({
        data: {
          email: invitacion.email,
          nombreCompleto: invitacion.nombre_completo,
          passwordHash,
          rolId: invitacion.rol_id,
          avatarUrl: dto.avatarUrl || null,
          fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null,
          fechaIngreso: new Date(),
          biografia: dto.biografia || null,
          estado: 'ACTIVO',
        },
        include: {
          rol: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              color: true,
            },
          },
        },
      });

      // Marcar invitación como utilizada
      await prisma.invitacion.update({
        where: { id: invitacion.id },
        data: {
          fue_utilizada: true,
          fecha_utilizacion: new Date(),
        },
      });

      return nuevoUsuario;
    });

    return {
      message: 'Registro completado exitosamente',
      usuario: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  /**
   * Completar registro por administrador - El admin completa el registro del usuario invitado
   */
  async completarRegistroPorAdmin(dto: CompletarRegistroPorAdminDto) {
    // Validar invitación
    const invitacion = await this.findByToken(dto.token);

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Crear usuario en una transacción
    const usuario = await this.prismaService.$transaction(async (prisma) => {
      // Crear usuario
      const nuevoUsuario = await prisma.usuario.create({
        data: {
          email: invitacion.email,
          nombreCompleto: invitacion.nombre_completo,
          passwordHash,
          rolId: invitacion.rol_id,
          avatarUrl: dto.avatarUrl || null,
          fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null,
          fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : new Date(),
          biografia: dto.biografia || null,
          estado: 'ACTIVO',
        },
        include: {
          rol: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              color: true,
            },
          },
        },
      });

      // Marcar invitación como utilizada
      await prisma.invitacion.update({
        where: { id: invitacion.id },
        data: {
          fue_utilizada: true,
          fecha_utilizacion: new Date(),
        },
      });

      return nuevoUsuario;
    });

    return {
      message: 'Usuario registrado exitosamente por el administrador',
      usuario: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  /**
   * Obtener estadísticas de invitaciones
   */
  async obtenerEstadisticas() {
    const [total, utilizadas, pendientes, expiradas] = await Promise.all([
      // Total de invitaciones
      this.prismaService.invitacion.count(),
      
      // Invitaciones utilizadas
      this.prismaService.invitacion.count({
        where: { fue_utilizada: true },
      }),
      
      // Invitaciones pendientes (no utilizadas y no expiradas)
      this.prismaService.invitacion.count({
        where: {
          fue_utilizada: false,
          fecha_expiracion: {
            gte: new Date(),
          },
        },
      }),
      
      // Invitaciones expiradas (no utilizadas y fecha pasada)
      this.prismaService.invitacion.count({
        where: {
          fue_utilizada: false,
          fecha_expiracion: {
            lt: new Date(),
          },
        },
      }),
    ]);

    // Obtener invitaciones recientes (últimas 10 utilizadas)
    const invitacionesRecientes = await this.prismaService.invitacion.findMany({
      where: {
        fue_utilizada: true,
        fecha_utilizacion: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        nombre_completo: true,
        fecha_utilizacion: true,
        fecha_creacion: true,
        rol: {
          select: {
            nombre: true,
            color: true,
          },
        },
      },
      orderBy: {
        fecha_utilizacion: 'desc',
      },
      take: 10,
    });

    // Calcular tiempo promedio de aceptación
    const invitacionesConTiempo = await this.prismaService.invitacion.findMany({
      where: {
        fue_utilizada: true,
        fecha_utilizacion: {
          not: null,
        },
      },
      select: {
        fecha_creacion: true,
        fecha_utilizacion: true,
      },
    });

    let tiempoPromedioHoras = 0;
    if (invitacionesConTiempo.length > 0) {
      const tiempoTotal = invitacionesConTiempo.reduce((acc, inv) => {
        const diff = new Date(inv.fecha_utilizacion!).getTime() - new Date(inv.fecha_creacion).getTime();
        return acc + diff;
      }, 0);
      tiempoPromedioHoras = Math.round((tiempoTotal / invitacionesConTiempo.length) / (1000 * 60 * 60));
    }

    return {
      total,
      utilizadas,
      pendientes,
      expiradas,
      tasaAceptacion: total > 0 ? ((utilizadas / total) * 100).toFixed(2) + '%' : '0%',
      tiempoPromedioAceptacionHoras: tiempoPromedioHoras,
      invitacionesRecientes,
    };
  }

}
