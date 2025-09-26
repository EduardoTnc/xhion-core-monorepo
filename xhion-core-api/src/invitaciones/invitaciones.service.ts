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

    this.enviarEmailInvitacion(dto.email, token);
    return invitacion;
  }

  private enviarEmailInvitacion(email: string, token: string) {
    // TODO: Integrar proveedor de email (SES/SendGrid). Por ahora, log de depuración.
    // eslint-disable-next-line no-console
    console.log(`[Invitaciones] Enviar email a ${email} con token: ${token}`);
  }

}
