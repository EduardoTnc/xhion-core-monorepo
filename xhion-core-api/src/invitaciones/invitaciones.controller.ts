import { Controller, Post, Body, Req, Get, Param, UseGuards } from '@nestjs/common';
import { InvitacionesService } from './invitaciones.service';
import { CreateInvitacionDto } from './dto/create-invitacion.dto';
import { AceptarInvitacionDto, CompletarRegistroPorAdminDto } from './dto/aceptar-invitacion.dto';
import { Auditar } from '../auditoria/auditar.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequiresPermission } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Invitaciones')
@Controller('invitaciones')
export class InvitacionesController {

constructor(private readonly invitacionesService: InvitacionesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('usuarios.invitar')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear invitación de usuario' })
  @ApiResponse({ status: 201, description: 'Invitación creada exitosamente' })
  @Auditar('CREAR_INVITACION')
  create(@Body() createInvitacionDto: CreateInvitacionDto, @Req() req: Request & { user?: any; auditUsuarioId?: string; auditDetalles?: string }) {
    req.auditUsuarioId = req.user?.id ?? null;
    req.auditDetalles = JSON.stringify({ email: createInvitacionDto.email, invitado_por_id: createInvitacionDto.invitado_por_id });
    return this.invitacionesService.create(createInvitacionDto);
  }

  @Get(':token')
  @ApiOperation({ summary: 'Obtener invitación por token' })
  @ApiResponse({ status: 200, description: 'Invitación encontrada' })
  @ApiResponse({ status: 400, description: 'Invitación no válida' })
  findByToken(@Param('token') token: string) {
    return this.invitacionesService.findByToken(token);
  }

  @Post('aceptar')
  @ApiOperation({ summary: 'Aceptar invitación - Usuario completa su registro' })
  @ApiResponse({ status: 201, description: 'Registro completado exitosamente' })
  @ApiResponse({ status: 400, description: 'Invitación no válida o expirada' })
  @Auditar('ACEPTAR_INVITACION')
  aceptarInvitacion(@Body() dto: AceptarInvitacionDto, @Req() req: Request & { auditUsuarioId?: string; auditDetalles?: string }) {
    req.auditUsuarioId = undefined; // Usuario aún no existe
    req.auditDetalles = JSON.stringify({ email: dto.token.substring(0, 10) + '...' });
    return this.invitacionesService.aceptarInvitacion(dto);
  }

  @Post('completar-por-admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('usuarios.crear')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Completar registro por administrador' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Invitación no válida o expirada' })
  @Auditar('COMPLETAR_REGISTRO_POR_ADMIN')
  completarRegistroPorAdmin(
    @Body() dto: CompletarRegistroPorAdminDto,
    @Req() req: Request & { user?: any; auditUsuarioId?: string; auditDetalles?: string }
  ) {
    req.auditUsuarioId = req.user?.id ?? null;
    req.auditDetalles = JSON.stringify({ token: dto.token.substring(0, 10) + '...' });
    return this.invitacionesService.completarRegistroPorAdmin(dto);
  }

  @Get('estadisticas')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiresPermission('invitaciones.ver')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener estadísticas de invitaciones' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de invitaciones',
    schema: {
      example: {
        total: 50,
        utilizadas: 35,
        pendientes: 10,
        expiradas: 5,
        tasaAceptacion: '70.00%',
        tiempoPromedioAceptacionHoras: 12,
        invitacionesRecientes: [
          {
            id: 'abc-123',
            email: 'usuario@ejemplo.com',
            nombre_completo: 'Juan Pérez',
            fecha_utilizacion: '2025-10-29T05:30:00.000Z',
            fecha_creacion: '2025-10-28T18:00:00.000Z',
            rol: {
              nombre: 'Editor',
              color: 'bg-blue-500',
            },
          },
        ],
      },
    },
  })
  obtenerEstadisticas() {
    return this.invitacionesService.obtenerEstadisticas();
  }

}
