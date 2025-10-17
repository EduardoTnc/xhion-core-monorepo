import { Injectable } from '@nestjs/common';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';

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
        invitado_por_id: true,
        fecha_creacion: true,
      },
    });

    if (!invitacion) {
      throw new BadRequestException('Invitación no encontrada');
    }

    if (invitacion.fue_utilizada) {
      throw new BadRequestException('Esta invitación ya fue utilizada');
    }

    if (new Date(invitacion.fecha_expiracion) < new Date()) {
      throw new BadRequestException('Esta invitación ha expirado');
    }

    return invitacion;
  }

}
