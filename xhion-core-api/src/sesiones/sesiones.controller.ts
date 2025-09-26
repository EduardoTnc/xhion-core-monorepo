import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Auditar } from '../auditoria/auditar.decorator';
import type { Request } from 'express';

@Controller('sesiones')
@UseGuards(JwtAuthGuard)
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @Get()
  async findAll(@Req() req: Request & { user: any; auditUsuarioId?: string }) {
    req.auditUsuarioId = req.user.id;
    return this.sesionesService.listSessions(req.user.id);
  }

  @Delete(':id')
  @Auditar('REVOCAR_SESION')
  async remove(@Param('id') id: string, @Req() req: Request & { user: any; auditUsuarioId?: string }) {
    req.auditUsuarioId = req.user.id;
    await this.sesionesService.revokeSession(id, req.user.id);
    return { success: true };
  }
}
