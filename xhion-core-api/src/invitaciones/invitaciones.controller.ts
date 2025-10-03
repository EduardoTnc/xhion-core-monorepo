import { Controller, Post, Body, Req, Get, Param } from '@nestjs/common';
import { InvitacionesService } from './invitaciones.service';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { Auditar } from '../auditoria/auditar.decorator';
import type { Request } from 'express';

@Controller('invitaciones')
export class InvitacionesController {

constructor(private readonly invitacionesService: InvitacionesService) {}

  @Post()
  @Auditar('CREAR_INVITACION')
  create(@Body() createInvitacionDto: CreateInvitacionDto, @Req() req: Request & { user?: any; auditUsuarioId?: string; auditDetalles?: string }) {
    req.auditUsuarioId = req.user?.id ?? null;
    req.auditDetalles = JSON.stringify({ email: createInvitacionDto.email, invitado_por_id: createInvitacionDto.invitado_por_id });
    return this.invitacionesService.create(createInvitacionDto);
  }

  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.invitacionesService.findByToken(token);
  }

}
