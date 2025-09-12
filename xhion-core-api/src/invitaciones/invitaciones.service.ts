import { Injectable } from '@nestjs/common';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvitacionesService {

  constructor(private readonly prismaService: PrismaService) {}

  create(createInvitacionDto: CreateInvitacionDto) {
    return this.prismaService.invitacion.create({
      data: {
        ...createInvitacionDto,
        token: createInvitacionDto.email,
        fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000),
        invitado_por_id: createInvitacionDto.invitado_por_id,
      },
    });
  }

}
